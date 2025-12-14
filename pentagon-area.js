const pentagonSide = 7;
const pentagonApothem = 4.5;

function calculatePentagonArea(sideLength, apothemLength) {
  if (typeof sideLength !== "number" || typeof apothemLength !== "number") {
    throw new Error("Pentagon dimensions should be numbers.");
  }

  const perimeter = sideLength * 5;
  return (perimeter * apothemLength) / 2;
}

function appendPentagonArea() {
  const block3 = getBlock3Element();
  if (!block3) {
    return;
  }

  const area = calculatePentagonArea(pentagonSide, pentagonApothem);
  const resultElement = document.createElement("p");
  resultElement.textContent = `Площа п'ятикутника: ${area.toFixed(2)} кв. од.`;
  block3.appendChild(resultElement);
}

function getBlock3Element() {
  return (
    document.querySelector('[data-block="3"]') ||
    document.querySelector(".main-and-center-content main") ||
    document.querySelector("main")
  );
}
