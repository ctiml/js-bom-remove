var upload = document.getElementById("upload");
var clearButton = document.getElementById("clear");
var filelist = document.getElementById("filelist");
var acceptedTypes = {
  'text/plain': true,
  'text/csv': true,
  'text/xml': true,
  'application/json': true
};

function clearFileList() {
  filelist.innerText = "";
  console.log('clear');
}

function createRow(file, message, content) {
  var div = document.createElement('div');
  div.classList.add("row");
  var name = document.createElement('span');
  name.classList.add("filename");
  name.innerText = file.name;
  div.appendChild(name);

  if (message) {
    var msg = document.createElement('span');
    msg.classList.add("message");
    msg.innerText = message;
    div.appendChild(msg);
  }

  if (content) {
    var alink = document.createElement('a');
    alink.classList.add("download");
    alink.innerText = "下載";
    alink.download = file.name;
    alink.href = "data:" + file.type + "," + encodeURIComponent(content);
    div.appendChild(alink);
  }
  return div;
}

function checkBOM(buffer) {
  var arr = new Uint8Array(buffer);
  if (arr.subarray(0, 3).join() === "239,187,191") {
    return { enc: 'utf-8', bom: 3 }
  }
  var bom = arr.subarray(0, 2).join();
  if (bom === "255,254") {
    return { enc: 'utf-16le', bom: 2 }
  } else if (bom === "254,255") {
    return { enc: 'utf-16le', bom: 2 }
  } else {
    return false;
  }
}

function processFiles(event) {
  for (var i = 0; i < upload.files.length; i++) {
    (function(file){
      if (acceptedTypes[file.type] === true) {
        var reader = new FileReader();
        reader.onload = function(event) {
          var buffer = event.target.result;
          var ret = checkBOM(buffer);
          var content = null;
          var div = null;
          if (ret) {
            content = (new TextDecoder(ret.enc)).decode(buffer);
            div = createRow(file, "有 BOM 字元", content);
          } else {
            div = createRow(file);
          }
          filelist.appendChild(div);
        }
        reader.readAsArrayBuffer(file);
      } else {
        var div = createRow(file, "檔案格式不符");
        filelist.appendChild(div);
      }
    })(upload.files[i]);
  }
}

window.onload = function() {
  upload.addEventListener('change', processFiles);
  clearButton.addEventListener('click', clearFileList);
}
