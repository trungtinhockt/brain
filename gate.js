// Đồng Bộ - cổng mật khẩu (XOR + Base64), áp dụng cho index.html
// Đây KHÔNG phải mã hoá bảo mật thật sự (không thể có trên site tĩnh không máy chủ) -
// chỉ nhằm tránh index trực tiếp qua công cụ tìm kiếm / xem lướt qua. Xem thẻ noindex/nofollow đi kèm.

function xorDecryptToString(b64, key) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

function initGate(password, onUnlock) {
  const overlay = document.getElementById("gate-overlay");
  const input = document.getElementById("gate-input");
  const btn = document.getElementById("gate-submit");
  const err = document.getElementById("gate-error");
  const blob = document.getElementById("gate-payload").textContent.trim();

  function tryUnlock(candidate) {
    try {
      const html = xorDecryptToString(blob, candidate);
      if (!html.startsWith("<!--OK-->")) throw new Error("bad password");
      document.getElementById("site-content").innerHTML = html.replace("<!--OK-->", "");
      document.getElementById("site-content").style.display = "flex";
      overlay.style.display = "none";
      try { sessionStorage.setItem("dongbo_pw", candidate); } catch (e) {}
      if (onUnlock) onUnlock();
      return true;
    } catch (e) {
      return false;
    }
  }

  function submitFromInput() {
    if (!tryUnlock(input.value)) {
      err.textContent = "Sai mật khẩu. Thử lại.";
      input.value = "";
      input.focus();
    }
  }

  btn.addEventListener("click", submitFromInput);
  input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") submitFromInput(); });

  let remembered = null;
  try { remembered = sessionStorage.getItem("dongbo_pw"); } catch (e) {}
  if (remembered && tryUnlock(remembered)) return;

  input.focus();
}
