// Facilitates queries on mongodb
function caseInsensitive(keyword){
  // Trim
  keyword = keyword.replace(/^\s+|\s+$/g, '');

  return new RegExp(keyword, 'gi');
}
