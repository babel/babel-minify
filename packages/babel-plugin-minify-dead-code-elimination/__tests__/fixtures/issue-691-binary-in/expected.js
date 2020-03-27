function foo(props) {
  let bar = ("width" in props);
  delete props.width;

  if (bar) {
    console.log("foo");
  }
}