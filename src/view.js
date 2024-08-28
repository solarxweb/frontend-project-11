const render = (state) => {
  // const input = document.querySelector('input');
  const result = document.querySelector(".result"); // Assuming you have a result element

  // Validate input field style
  if (!state.form.valid) {
    result.textContent = `${state.errors[0]}`;
  } else {
    result.textContent = 'Success!';
  }
};

export default render;
