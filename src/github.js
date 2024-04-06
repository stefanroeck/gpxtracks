export const renderGitHubIcon = (map) => {
  L.Control.GitHubIcon = L.Control.extend({
    onAdd: function () {
      const img = L.DomUtil.create("img");
      img.src = "github-mark.svg";
      img.className = "leaflet-github-icon";
      const link = L.DomUtil.create("a");
      link.href = "https://github.com/stefanroeck/gpxtracks";
      link.appendChild(img);
      return link;
    },
    onRemove: function () {
      // Nothing to do here
    },
  });

  L.control.githubIcon = function (opts) {
    return new L.Control.GitHubIcon(opts);
  };

  return L.control.githubIcon({ position: "topleft" }).addTo(map);
};
