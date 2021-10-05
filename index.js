const https = require('https')
const fs = require('fs')

const options = {
    ca: fs.readFileSync('./certs/rootCACert.pem'),
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-cer.pem'),
    dhparam: fs.readFileSync('./certs/dhparam.pem'),
    ecdhCurve: 'auto',
    honorCipherOrder: true,
}

https.createServer(options, function (req, res) {
    res.writeHead(200)
    res.end('tls v1.3')
}).listen(4555, "0.0.0.0", () => {
    console.info(`Listening`)
})