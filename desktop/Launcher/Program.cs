using System.Diagnostics;
using System.IO.Compression;
using System.Net.Sockets;
using System.Reflection;
using System.Text;

internal static class Program
{
    private const string AppFolderName = "TourismCarbonDashboard";
    private const int PreferredPort = 3000;
    private const int ReadyTimeoutMs = 120_000;

    private static int Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.Title = "관광탄소발자국 대시보드";

        try
        {
            PrintBanner();
            var appDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                AppFolderName,
                "app");

            Console.WriteLine("준비 중… (처음 실행 시 잠시 걸릴 수 있습니다)");
            var version = ReadEmbeddedText("payload.version") ?? "0";
            ExtractPayload(appDir, version);

            // 배포본에서는 빌드 PC의 환경변수가 있어도 토큰을 쓰지 않음
            Environment.SetEnvironmentVariable("HUGGINGFACE_API_KEY", "");
            Environment.SetEnvironmentVariable("TAVILY_API_KEY", "");
            Environment.SetEnvironmentVariable("SERPER_API_KEY", "");

            var port = FindFreePort(PreferredPort);
            Environment.SetEnvironmentVariable("PORT", port.ToString());
            Environment.SetEnvironmentVariable("HOSTNAME", "127.0.0.1");

            var nodeExe = Path.Combine(appDir, "runtime", "node.exe");
            var serverJs = Path.Combine(appDir, "server.js");
            if (!File.Exists(nodeExe) || !File.Exists(serverJs))
            {
                throw new FileNotFoundException("실행에 필요한 파일이 없습니다. EXE를 다시 받아 주세요.");
            }

            Console.WriteLine($"서버 시작 (http://127.0.0.1:{port}) …");
            using var server = StartServer(nodeExe, serverJs, appDir, port);

            if (!WaitUntilReady(port, ReadyTimeoutMs, server))
            {
                throw new TimeoutException("서버가 준비되지 않았습니다. 방화벽/백신 설정을 확인한 뒤 다시 시도해 주세요.");
            }

            var url = $"http://127.0.0.1:{port}/";
            Console.WriteLine();
            Console.WriteLine($"브라우저를 엽니다: {url}");
            Console.WriteLine("AI 기능은 화면 우측 상단 [환경 설정]에서 Hugging Face 토큰을 등록하세요.");
            Console.WriteLine();
            Console.WriteLine("※ 이 창을 닫으면 대시보드가 종료됩니다.");
            Console.WriteLine();

            OpenBrowser(url);
            server.WaitForExit();
            return server.ExitCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine();
            Console.WriteLine("오류가 발생했습니다:");
            Console.WriteLine(ex.Message);
            Console.WriteLine();
            Console.WriteLine("아무 키나 누르면 종료합니다…");
            try { Console.ReadKey(true); } catch { /* ignore */ }
            return 1;
        }
    }

    private static void PrintBanner()
    {
        Console.WriteLine("========================================");
        Console.WriteLine(" 관광행동 기반 탄소발자국 대시보드");
        Console.WriteLine("========================================");
        Console.WriteLine();
    }

    private static void ExtractPayload(string appDir, string version)
    {
        Directory.CreateDirectory(appDir);
        var marker = Path.Combine(appDir, ".payload-version");

        if (File.Exists(marker) && File.ReadAllText(marker).Trim() == version &&
            File.Exists(Path.Combine(appDir, "server.js")))
        {
            return;
        }

        // 버전 바뀌면 깨끗이 다시 풀기 (토큰은 data/runtime 에 있으므로 상위 폴더에 보존)
        foreach (var entry in Directory.Exists(appDir)
                     ? Directory.GetFileSystemEntries(appDir)
                     : Array.Empty<string>())
        {
            var name = Path.GetFileName(entry);
            if (name.Equals("data", StringComparison.OrdinalIgnoreCase))
            {
                // data/runtime 만 남기고 excel 등은 교체
                var runtime = Path.Combine(entry, "runtime");
                var runtimeBackup = Path.Combine(
                    Path.GetTempPath(),
                    "tcd-runtime-backup-" + Guid.NewGuid().ToString("N"));
                if (Directory.Exists(runtime))
                {
                    CopyDirectory(runtime, runtimeBackup);
                }
                try
                {
                    if (Directory.Exists(entry)) Directory.Delete(entry, true);
                    else File.Delete(entry);
                }
                catch
                {
                    // ignore locked files
                }
                if (Directory.Exists(runtimeBackup))
                {
                    Directory.CreateDirectory(Path.Combine(appDir, "data"));
                    CopyDirectory(runtimeBackup, Path.Combine(appDir, "data", "runtime"));
                    try { Directory.Delete(runtimeBackup, true); } catch { /* ignore */ }
                }
                continue;
            }

            try
            {
                if (Directory.Exists(entry)) Directory.Delete(entry, true);
                else File.Delete(entry);
            }
            catch
            {
                // ignore
            }
        }

        Directory.CreateDirectory(appDir);
        using var zipStream = OpenEmbeddedPayload();
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        archive.ExtractToDirectory(appDir, overwriteFiles: true);
        File.WriteAllText(marker, version);
    }

    private static string? ReadEmbeddedText(string suffix)
    {
        var asm = Assembly.GetExecutingAssembly();
        var name = asm.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith(suffix, StringComparison.OrdinalIgnoreCase));
        if (name is null) return null;
        using var stream = asm.GetManifestResourceStream(name);
        if (stream is null) return null;
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return reader.ReadToEnd().Trim();
    }

    private static Stream OpenEmbeddedPayload()
    {
        var asm = Assembly.GetExecutingAssembly();
        var name = asm.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("payload.zip", StringComparison.OrdinalIgnoreCase));
        if (name is null)
        {
            throw new InvalidOperationException(
                "내장 데이터가 없습니다. 배포용 EXE를 scripts/desktop/build-exe.mjs 로 다시 빌드하세요.");
        }
        return asm.GetManifestResourceStream(name)
               ?? throw new InvalidOperationException("내장 데이터를 열 수 없습니다.");
    }

    private static Process StartServer(string nodeExe, string serverJs, string appDir, int port)
    {
        var psi = new ProcessStartInfo
        {
            FileName = nodeExe,
            Arguments = $"\"{serverJs}\"",
            WorkingDirectory = appDir,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = false,
        };
        psi.Environment["PORT"] = port.ToString();
        psi.Environment["HOSTNAME"] = "127.0.0.1";
        psi.Environment["HUGGINGFACE_API_KEY"] = "";
        psi.Environment["TAVILY_API_KEY"] = "";
        psi.Environment["SERPER_API_KEY"] = "";

        var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
        process.OutputDataReceived += (_, data) =>
        {
            if (!string.IsNullOrWhiteSpace(data.Data))
                Console.WriteLine(data.Data);
        };
        process.ErrorDataReceived += (_, data) =>
        {
            if (!string.IsNullOrWhiteSpace(data.Data))
                Console.WriteLine(data.Data);
        };
        if (!process.Start())
            throw new InvalidOperationException("서버 프로세스를 시작하지 못했습니다.");
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        return process;
    }

    private static bool WaitUntilReady(int port, int timeoutMs, Process server)
    {
        var sw = Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            if (server.HasExited) return false;
            try
            {
                using var client = new TcpClient();
                var task = client.ConnectAsync("127.0.0.1", port);
                if (task.Wait(500) && client.Connected) return true;
            }
            catch
            {
                // retry
            }
            Thread.Sleep(400);
        }
        return false;
    }

    private static int FindFreePort(int preferred)
    {
        try
        {
            var listener = new TcpListener(System.Net.IPAddress.Loopback, preferred);
            listener.Start();
            listener.Stop();
            return preferred;
        }
        catch
        {
            var listener = new TcpListener(System.Net.IPAddress.Loopback, 0);
            listener.Start();
            var port = ((System.Net.IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }
    }

    private static void OpenBrowser(string url)
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true,
            });
        }
        catch
        {
            Console.WriteLine($"브라우저를 직접 열어 주세요: {url}");
        }
    }

    private static void CopyDirectory(string source, string dest)
    {
        Directory.CreateDirectory(dest);
        foreach (var file in Directory.GetFiles(source))
        {
            File.Copy(file, Path.Combine(dest, Path.GetFileName(file)), true);
        }
        foreach (var dir in Directory.GetDirectories(source))
        {
            CopyDirectory(dir, Path.Combine(dest, Path.GetFileName(dir)));
        }
    }
}
