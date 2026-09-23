import http from "http";

const PORT = process.env.PORT || 3000;

// ==========================================
// ANTREAN AVATAR
// ==========================================

let pendingAvatars = [];

// ==========================================
// SERVER
// ==========================================

const server = http.createServer((req, res) => {

    // CORS
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // OPTIONS
    if (req.method === "OPTIONS") {

        res.writeHead(204);
        res.end();

        return;
    }

    // ======================================
    // HOME
    // ======================================

    if (
        req.method === "GET" &&
        req.url === "/"
    ) {

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true,
            service: "TikTok Roblox Relay",
            queue: pendingAvatars.length
        }));

        return;
    }

    // ======================================
    // NODE.JS → RELAY
    // ======================================

    if (
        req.method === "POST" &&
        req.url === "/avatar"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {

                const data =
                    JSON.parse(body);

                const username =
                    String(
                        data.username || ""
                    ).trim();

                if (!username) {

                    res.writeHead(400, {
                        "Content-Type":
                            "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        error:
                            "Username kosong"
                    }));

                    return;
                }

                // Masukkan ke antrean
                pendingAvatars.push(username);

                console.log(
                    "[RELAY] Avatar masuk:",
                    username
                );

                console.log(
                    "[QUEUE] Jumlah:",
                    pendingAvatars.length
                );

                res.writeHead(200, {
                    "Content-Type":
                        "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    username: username,
                    queue:
                        pendingAvatars.length
                }));

            } catch (error) {

                res.writeHead(400, {
                    "Content-Type":
                        "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    error:
                        "JSON tidak valid"
                }));
            }

        });

        return;
    }

    // ======================================
    // ROBLOX → RELAY
    // ======================================

    if (
        req.method === "GET" &&
        req.url === "/avatar"
    ) {

        res.writeHead(200, {
            "Content-Type":
                "application/json"
        });

        // Tidak ada avatar
        if (
            pendingAvatars.length === 0
        ) {

            res.end(JSON.stringify({
                success: true,
                username: null
            }));

            return;
        }

        // Ambil avatar pertama
        const username =
            pendingAvatars.shift();

        console.log(
            "[ROBLOX] Avatar diambil:",
            username
        );

        console.log(
            "[QUEUE] Sisa:",
            pendingAvatars.length
        );

        res.end(JSON.stringify({
            success: true,
            username: username
        }));

        return;
    }

    // ======================================
    // CEK QUEUE
    // ======================================

    if (
        req.method === "GET" &&
        req.url === "/queue"
    ) {

        res.writeHead(200, {
            "Content-Type":
                "application/json"
        });

        res.end(JSON.stringify({
            success: true,
            count:
                pendingAvatars.length,
            avatars:
                pendingAvatars
        }));

        return;
    }

    // ======================================
    // NOT FOUND
    // ======================================

    res.writeHead(404, {
        "Content-Type":
            "application/json"
    });

    res.end(JSON.stringify({
        success: false,
        error: "Not Found"
    }));
});

// ==========================================
// START
// ==========================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Relay berjalan di port ${PORT}`
        );

    }
);
