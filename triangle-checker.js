const triangleCookieKey = "triangleResult";

function initTriangleChecker() {
  const form = document.querySelector("[data-triangle-form]");
  const block3 = getBlock3Element();

  if (!form || !block3) {
    return;
  }

  const savedResult = getCookie(triangleCookieKey);
  if (savedResult) {
    form.style.display = "none";
    alert(
      `${savedResult}\nПісля натискання "OK" дані буде видалено з cookies.`
    );
    deleteCookie(triangleCookieKey);
    alert('Cookies видалено. Натисніть "OK", щоб перезавантажити сторінку.');
    window.location.reload();
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const a = parseFloat(form.elements.sideA.value);
    const b = parseFloat(form.elements.sideB.value);
    const c = parseFloat(form.elements.sideC.value);

    if (![a, b, c].every((value) => Number.isFinite(value) && value > 0)) {
      alert("Введіть додатні числові значення довжин сторін (> 0).");
      return;
    }

    const canBuild = canBuildTriangle(a, b, c);
    const message = `Результат перевірки трикутника (a=${a}, b=${b}, c=${c}): ${
      canBuild ? "можна побудувати" : "побудувати не можна"
    }.`;

    alert(message);
    setCookie(triangleCookieKey, message);
  });
}

function canBuildTriangle(a, b, c) {
  return a + b > c && a + c > b && b + c > a;
}

function setCookie(name, value, days = 1) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
  const cookieString = document.cookie || "";
  const cookies = cookieString.split(";").map((item) => item.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!target) {
    return null;
  }
  return decodeURIComponent(target.split("=")[1]);
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(
    name
  )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}