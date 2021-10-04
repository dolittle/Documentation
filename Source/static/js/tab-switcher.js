const key = 'programming-language';
const defaultLanguage = 'C#';

let savedLanguage = localStorage.getItem(key) || defaultLanguage;

activateTabs(savedLanguage);

$('[data-toggle="tab"]').on('click', event => {
    event.preventDefault();
    let chosenLanguage = event.target.innerText;

    const tabs = $(event.target).parents('ul.nav-tabs')[0];
    const startScreenPosition = tabs.getBoundingClientRect().top;

    activateTabs(chosenLanguage);

    const endScreenPosition = tabs.getBoundingClientRect().top;
    window.scrollBy(0, endScreenPosition - startScreenPosition);
});

function activateTabs(language) {
    localStorage.setItem(key, language);
    $(`[data-toggle="tab"]:contains(${language})`).tab('show');
}
