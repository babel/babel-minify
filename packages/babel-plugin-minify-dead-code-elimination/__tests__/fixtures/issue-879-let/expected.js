let isWeb = true;

exports.setTitle = function (title) {
  if (isWeb) {
    document.title = title;
  } else {
    console.log(title);
  }
};

process.on('message', () => {
  isWeb = false;
});