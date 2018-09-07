const choiceToNumberMap = {
  'keo': 1,
  'bau': 2,
  'ga': 3,
  'tom': 4,
  'ca': 5,
  'cua': 6
};

class TextParser {
  removeUnicode(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
  }
  
  charToNumber(str) {
    const charObj = {
      "mot": 1,
      "hai": 2,
      "ba": 3,
      "bon": 4,
      "nam": 5,
      "sau": 6,
      "bay": 7,
      "tam": 8,
      "chin": 9,
      "muoi": 10
    };
    
    for (let p in charObj) {
      str = str.replace(new RegExp(p + " ", 'g'),
        charObj[p] + " ");
    }
    return str;
  }
  
  formatComment(text) {
    const { charToNumber, removeUnicode } = this;
    const cleanMessage = charToNumber(removeUnicode(text));
    const regex = /(\d+)( |-)?(cop|bau|ga|tom|ca|cua)/g;
    const matchesArr = cleanMessage.match(regex);
    if (!matchesArr) return [];
    
    const messageAnalytic = matchesArr.map(match => {
      const execMatch = regex.exec(match);
      regex.exec(match);
      const [, number, , name] = execMatch;
      const numberChose = parseInt(number, 10);
      const choice = choiceToNumberMap[name];
      return { numberChose, choice };
    });
    return messageAnalytic;
  }
  
}

module.exports = new TextParser();