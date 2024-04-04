const result =
  /^(http|https):\/\/([^<>/:\\?*]{1,256})\.?([^\s]{2,64})(:[0-9]*)?(\/[^<>\s]*)?(\?[^<>\s]*)?$/.test(
    'http://example.com/image.jpg?query=string&',
  );
console.log(result);
