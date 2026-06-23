<!DOCTYPE html>
<html>
<head>
  <title>Magnate XMD Pairing</title>
</head>
<body>
  <h2>MAGNATE XMD PAIRING SITE</h2>

  <input id="num" placeholder="Enter number 2557xxxxxxx">
  <button onclick="pair()">Get Code</button>

  <p id="out"></p>

  <script>
    async function pair() {
      let number = document.getElementById("num").value;

      let res = await fetch("/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number })
      });

      let data = await res.json();

      document.getElementById("out").innerText =
        "PAIR CODE: " + data.code;
    }
  </script>
</body>
</html>
