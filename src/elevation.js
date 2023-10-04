import * as echarts from "echarts";

const elevationPanel = document.querySelector("#elevation-div");
const elevationChart = document.querySelector("#elevation-chart");
var chart;

const chartOptions = (data, name) => {
  return {
    title: {
      subtext: name,
      subtextStyle: {
        fontWeight: "bold",
      },
      right: 60,
    },
    tooltip: {
      trigger: "axis",
      position: function (pt) {
        return [pt[0] + 20, "10%"];
      },
      formatter: function (params, ticket) {
        return `${params[0].value[2]}`;
      },
      axisPointer: {
        type: "line",
        lineStyle: {
          width: 1,
          type: "solid",
          color: "black",
        },
      },
    },
    toolbox: {
      show: false,
    },
    grid: {
      top: 20,
      bottom: 40,
      left: 60,
      right: 40,
    },
    xAxis: {
      name: "km",
      type: "value",
      axisLabel: {
        formatter: function (value) {
          return `${value}km`;
        },
        showMaxLabel: false,
        hideOverlap: true,
      },
      interval: 2,
      max: "dataMax",
    },
    yAxis: {
      name: "hm",
      nameGap: 5,
      type: "value",
    },
    series: [
      {
        name: "hm",
        type: "line",
        symbol: "none",
        sampling: "lttb",
        smooth: 1,
        lineStyle: {
          color: "#0d3c6c",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#086eb7",
            },
            {
              offset: 1,
              color: "#084e95",
            },
          ]),
        },
        data,
      },
    ],
  };
};

/**
 * @param {Array.<[number, number, string, string>} elevationData
 * @param {string} name
 */
export const showElevation = (elevationData, name) => {
  elevationPanel.style.display = "block";
  if (!chart) {
    chart = echarts.init(elevationChart);
    window.addEventListener("resize", function () {
      chart.resize();
    });
  }
  chart.setOption(chartOptions(elevationData, name));
};

export const hideElevation = () => {
  elevationPanel.style.display = "none";
};
