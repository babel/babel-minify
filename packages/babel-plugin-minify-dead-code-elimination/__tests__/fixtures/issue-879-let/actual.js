let isWeb = true;

exports.setTitle =  function setTitle(title) {
  if (isWeb) {
    document.title = title;
  } else {
    console.log(title);
  }
}

process.on('message', () => {
  isWeb = false;
});
