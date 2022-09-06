exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    docTitle: "Page not Found",
    path: "",
  });
  // res.status(404).sendFile(path.join(__dirname, 'views', '404.html')); -> ładowanie statycznej strony html z podaniem ścieżki
};
