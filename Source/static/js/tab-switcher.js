const key = 'programming-language';
const defaultLanguage = 'C#';

let savedLanguage = localStorage.getItem(key) || defaultLanguage;

activateTabs(savedLanguage);

$('[data-toggle="tab"').on('click', event => {
    event.preventDefault();
    let chosenLanguage = event.target.innerText;
    // console.log('you set chosen language', chosenLanguage);
    activateTabs(chosenLanguage);
});

function activateTabs(language) {
    localStorage.setItem(key, language);
    $(`[data-toggle="tab"]:contains(${language})`).tab('show');
}
