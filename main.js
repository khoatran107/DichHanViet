const tuDienURL = "https://vtudien.com/trung-viet/dictionary/nghia-cua-tu-";
const proxyURL = "https://empyrean-depth-410711.as.r.appspot.com/";
const googleTranslateURL = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=";

const form = document.getElementsByTagName("form")[0];
const inputTextarea = document.getElementsByTagName("textarea")[0];
const hanVietTextarea = document.getElementsByTagName("textarea")[1];
const loadingGIF = document.getElementById("loading");

form.onsubmit = (e) => {
  e.preventDefault();
  loadingGIF.style.display = "inline";
  let inputContent = inputTextarea.value.trim();
  let tiengTrung = "";
  fetch(
      googleTranslateURL + inputContent
  )
    .then((res) => res.text())
    .then((raw) => {
      const parser = JSON.parse(raw);
      tiengTrung = parser[0][0][0];
    })
    .then(() => {
      let tiengTrungCharacters = tiengTrung.split("");
      let tuHanViet = [];
      const numChar = tiengTrungCharacters.length;
      const p1 = Promise.resolve();
      p1.then(() => {
        for (let i = 0, p = Promise.resolve(); i < numChar; i++) {
          const char = tiengTrungCharacters[i];
          p.then(() => {
            fetch(proxyURL + tuDienURL + char)
              .then((res) => res.text())
              .then((hanVietRaw) => {
                const hanVietHTML = new DOMParser().parseFromString(
                  hanVietRaw,
                  "text/html"
                );
                const elements = hanVietHTML.getElementsByTagName("td");
                let word = "";
                for (const a of elements) {
                  const textContent = a.textContent;
                  if (textContent.includes("Hán Việt")) {
                    word = textContent
                      .split(":")[1]
                      .split(",")[0]
                      .trim()
                      .toUpperCase();
                    break;
                  }
                }
                tuHanViet[i] = word;
              }).catch((err) => {
                  console.log("Can't connect to PROXY");
              });
          });
        }
      }).then(() => {
        var timeout = setInterval(function () {
          if (tuHanViet.length === numChar) {
            let res = tuHanViet.join(" ");
            console.log(res);
            console.log(res.split(" ").length);
            if (res.split(" ").length === numChar) {
              hanVietTextarea.value = res;
              loadingGIF.style.display = "none";
              clearInterval(timeout);
            }
          }
        }, 500);
      }).catch((err) => {
          console.log("Can't connect to Google Translate API");
      });
    });
};
