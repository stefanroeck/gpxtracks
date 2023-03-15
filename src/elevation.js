const closeBtn = document.querySelector('#elevation-close');
const elevationPanel = document.querySelector('#elevation-div');

  export const initElevation = (map) => {
    closeBtn.addEventListener("click", () => {
        elevationPanel.style.display = 'none';
    });
  }

  export const showElevation = (gpx) => {
    elevationPanel.style.display = 'block';
  }

