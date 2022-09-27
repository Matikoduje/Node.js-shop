const deleteProduct = (button) => {
  const productId = button.parentNode.querySelector("[name=productId").value;
  const _csrf = button.parentNode.querySelector("[name=_csrf").value;

  const productElement = button.closest("article");

  fetch("/admin/product/" + productId, {
    method: "DELETE",
    headers: {
      "csrf-token": _csrf,
    },
  })
    .then((result) => result.json)
    .then((data) => {
      productElement.remove();
    })
    .catch((err) => console.log(err));
};
