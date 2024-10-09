var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var config = {
    staticPath: './',
    private_folder: ["config", "app_data"],
    listen_port: 3008,
    defaultFile: ["index.shtml", "index.html", "index.htm", "default.htm", "default.html", "home.html"],
    gzip: true,
    cache: true,
    contentType: {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml"
    }
};


http
    .createServer(function (request, response) {
        var pathName = path.normalize(url.parse(request.url).pathname);
        var extName = path.extname(pathName).toLowerCase(); // .js
        if (!extName && pathName.slice(-1) != '/') {
            pathName += '/';
        }

        var fullPath = config.staticPath + pathName;
        var extName2 = extName.replace(".", "");
        var fileName = path.basename(pathName, extName);
        var fileName2 = path.basename(pathName);
        var folders = path.dirname(pathName);
        var folderArr = folders.split("\\").filter((str) => str != "");
        var firstFolder = folderArr.length == 0 ? "" : folderArr[0];

        // console.log({
        //     "request.url": request.url,
        //     pathName,
        //     fullPath,
        //     extName,
        //     extName2,
        //     fileName,
        //     fileName2,
        //     folders,
        //     folderArr,
        //     firstFolder
        // });

        if (!extName) {
            var isfix = false;
            for (var i = 0; i < config.defaultFile.length; i++) {
                if (fs.existsSync(fullPath + config.defaultFile[i])) {
                    fullPath = fullPath + config.defaultFile[i];
                    isfix = true;
                    break;
                }
            }
            if (!isfix) {
                fullPath = fullPath + config.defaultFile[0];
            }
        }

        console.log(fullPath);
        if (
            config.private_folder.indexOf(firstFolder) != -1 ||
            fileName2 == "app.js"
        ) {
            response.writeHead(403, { "Content-Type": "text/html" });
            response.end("<h1>403 forbidden<h1>");
            return;
        }
        if (!fs.existsSync(fullPath)) {
            response.writeHead(400, { "Content-Type": "text/html" });
            response.end(
                "<h1>404 not found<br />File " + pathName + "  not found.<h1>"
            );
            return;
        }
        fs.readFile(fullPath, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain",
                });
                response.end(err.toString());
            } else {
                var _contentType = "text/html";
                if (extName2 && config.contentType[extName2]) {
                    _contentType = config.contentType[extName2];
                }
                response.writeHead(200, {
                    "Content-Type": _contentType,
                });
                response.write(file, "binary");
                response.end();
            }
        });
    })
    .listen(config.listen_port);
console.log("listing port %d .", config.listen_port);
