import "./style.css";

const burstGraphElem = document.getElementById("burstGraph");

const TIME_STEP = 0.1;
const GAP_SIZE = 10;

function updateMovingAverage(currentAvg, distance, distancedValue, newValue) {
  return currentAvg - distancedValue / distance + newValue / distance;
}

function getRateForTime(
  time,
  lastAvg,
  trafficTarget,
  limitAt,
  maxLimit,
  burstLimit,
  burstThreshold,
  trafficStartTime,
  trafficEndTime
) {
  if (time < trafficStartTime || time > trafficEndTime) {
    return 0;
  }
  if (trafficTarget <= limitAt) {
    return trafficTarget;
  }
  if (lastAvg < burstThreshold) {
    const expectedRate = Math.min(
      Math.max(burstLimit, maxLimit),
      trafficTarget
    );
    return Math.max(expectedRate, limitAt);
  }
  if (lastAvg >= burstThreshold) {
    const expectedRate = Math.min(maxLimit, trafficTarget);
    return Math.max(expectedRate, limitAt);
  }
}

function getData({
  limitAt,
  maxLimit,
  burstLimit,
  burstThreshold,
  burstTime,
  trafficStartTime,
  trafficEndTime,
  trafficTarget,
}) {
  const limitAtLine = { name: "Limit At", line: { width: 1 }, x: [], y: [] };
  const maxLimitLine = {
    name: "Max Limit",
    line: { width: 1 },
    x: [],
    y: [],
  };
  const burstLimitLine = {
    name: "Burst Limit",
    line: { width: 1 },
    x: [],
    y: [],
  };
  const burstThresholdLine = {
    name: "Burst Threshold",
    line: { width: 1 },
    x: [],
    y: [],
  };
  const rateLine = { name: "Actual Rate", line: { width: 3 }, x: [], y: [] };
  const avgRateLine = {
    name: "Average Rate",
    line: { width: 3 },
    x: [],
    y: [],
  };

  const firstStep = trafficStartTime - GAP_SIZE;
  const lastStep = trafficEndTime + GAP_SIZE;

  const averageDistance = Math.round(burstTime / TIME_STEP);

  for (let i = firstStep; i <= lastStep; i += TIME_STEP) {
    limitAtLine.x.push(i);
    maxLimitLine.x.push(i);
    burstLimitLine.x.push(i);
    burstThresholdLine.x.push(i);
    rateLine.x.push(i);
    avgRateLine.x.push(i);

    limitAtLine.y.push(limitAt);
    maxLimitLine.y.push(maxLimit);
    burstLimitLine.y.push(burstLimit);
    burstThresholdLine.y.push(burstThreshold);

    const lastAvg = avgRateLine.y[avgRateLine.y.length - 1] ?? 0;

    const currentRate = getRateForTime(
      i,
      lastAvg,
      trafficTarget,
      limitAt,
      maxLimit,
      burstLimit,
      burstThreshold,
      trafficStartTime,
      trafficEndTime
    );
    const currentAvg = updateMovingAverage(
      lastAvg,
      averageDistance,
      rateLine.y[rateLine.y.length - averageDistance] ?? 0,
      currentRate
    );

    rateLine.y.push(currentRate);
    avgRateLine.y.push(currentAvg);
  }

  return [
    rateLine,
    avgRateLine,
    limitAtLine,
    maxLimitLine,
    burstLimitLine,
    burstThresholdLine,
  ];
}

const limitAtInput = document.getElementById("limitAt");
const limitAtOutput = document.getElementById("limitAtOutput");
const maxLimitInput = document.getElementById("maxLimit");
const maxLimitOutput = document.getElementById("maxLimitOutput");
const burstLimitInput = document.getElementById("burstLimit");
const burstLimitOutput = document.getElementById("burstLimitOutput");
const burstThresholdInput = document.getElementById("burstThreshold");
const burstThresholdOutput = document.getElementById("burstThresholdOutput");
const burstTimeInput = document.getElementById("burstTime");
const burstTimeOutput = document.getElementById("burstTimeOutput");
const trafficStartTimeInput = document.getElementById("trafficStartTime");
const trafficStartTimeOutput = document.getElementById(
  "trafficStartTimeOutput"
);
const trafficEndTimeInput = document.getElementById("trafficEndTime");
const trafficEndTimeOutput = document.getElementById("trafficEndTimeOutput");
const trafficTargetInput = document.getElementById("trafficTarget");
const trafficTargetOutput = document.getElementById("trafficTargetOutput");

function render() {
  limitAtOutput.value = `${limitAtInput.value} Mbit/sec`;
  maxLimitOutput.value = `${maxLimitInput.value} Mbit/sec`;
  burstLimitOutput.value = `${burstLimitInput.value} Mbit/sec`;
  burstThresholdOutput.value = `${burstThresholdInput.value} Mbit/sec`;
  burstTimeOutput.value = `${burstTimeInput.value} Mbit/sec`;
  trafficStartTimeOutput.value = `${trafficStartTimeInput.value} sec`;
  trafficEndTimeOutput.value = `${trafficEndTimeInput.value} sec`;
  trafficTargetOutput.value = `${trafficTargetInput.value} Mbit/sec`;

  const data = getData({
    limitAt: Number(limitAtInput.value),
    maxLimit: Number(maxLimitInput.value),
    burstLimit: Number(burstLimitInput.value),
    burstThreshold: Number(burstThresholdInput.value),
    burstTime: Number(burstTimeInput.value),
    trafficStartTime: Number(trafficStartTimeInput.value),
    trafficEndTime: Number(trafficEndTimeInput.value),
    trafficTarget: Number(trafficTargetInput.value),
  });
  Plotly.newPlot(
    burstGraphElem,
    data,
    {
      paper_bgcolor: "#f3f3f3",
      plot_bgcolor: "#f3f3f3",
      margin: { t: 0 },
      xaxis: {
        title: {
          text: "Время (секунды)",
        },
      },
      yaxis: {
        title: {
          text: "Скорость (Мбит/с)",
        },
      },
    },
    { displayModeBar: false, scrollZoom: false, locale: "ru" }
  );
}
render();

limitAtInput.addEventListener("input", render);
maxLimitInput.addEventListener("input", render);
burstLimitInput.addEventListener("input", render);
burstThresholdInput.addEventListener("input", render);
burstTimeInput.addEventListener("input", render);
trafficStartTimeInput.addEventListener("input", render);
trafficEndTimeInput.addEventListener("input", render);
trafficTargetInput.addEventListener("input", render);
