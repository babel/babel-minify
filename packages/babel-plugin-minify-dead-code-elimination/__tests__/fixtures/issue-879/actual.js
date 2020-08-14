const isWeb = true;

exports.setTitle =  function (title) {
  if (isWeb) {
    document.title = title;
  } else {
    console.log(title);
  }

  const insideConst = true;

  if (insideConst) {
    console.log(insideConst);
  }
};
