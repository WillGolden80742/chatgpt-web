let isWebAccessOn = true;
let isProcessing = false;
var numWebResults = 1;
var timePeriod = "";
var region = "";
var textarea;
var source = false;

chrome.storage.sync.get(["num_web_results", "web_access", "region"], (data) => {
    numWebResults = data.num_web_results;
    isWebAccessOn = data.web_access;
    region = data.region || "wt-wt";
});


function showErrorMessage(e) {
    console.info("WebChatGPT error --> API error: ", e);
    var errorDiv = document.createElement("div");
    errorDiv.classList.add("web-chatgpt-error", "absolute", "bottom-0", "right-1", "dark:text-white", "bg-red-500", "p-4", "rounded-lg", "mb-4", "mr-4", "text-sm");
    errorDiv.innerHTML = "<b>An error occurred</b><br>" + e + "<br><br>Check the console for more details.";
    document.body.appendChild(errorDiv);
    setTimeout(() => { errorDiv.remove(); }, 5000);
}

function translate (region,query) {

    region = region.split("-")[1];
    switch (region) {
        case "pt":
            return "Exercício:\nDesconsiderando seu banco de dados desatualizado e com base nos resultados de busca, tente adivinhar:\n"+query+"\nRESPONDA EM PORTUGUÊS:";
        case "es":
            return "Ejercicio:\nDespreciando tu base de datos desactualizada y basándote en los resultados de búsqueda, intenta adivinar:\n"+query+"\nRESPONDE EN ESPAÑOL:";
        case "fr":
            return "Exercice:\nEn ignorant votre base de données obsolète et en vous basant sur les résultats de recherche, essayez de deviner:\n"+query+"\nREPONDEZ EN FRANÇAIS:";
        case "de":
            return "Übung:\nIgnorieren Sie Ihre veraltete Datenbank und basierend auf den Suchergebnissen versuchen Sie zu erraten:\n"+query+"\nANTWORTEN SIE AUF DEUTSCH:";
        case "it":
            return "Esercizio:\nIgnorando il tuo database obsoleto e basandoti sui risultati di ricerca, prova a indovinare:\n"+query+"\nRISPOSTA IN ITALIANO:";
        case "ru":
            return "Упражнение:\nИгнорируя вашу устаревшую базу данных и основываясь на результатах поиска, попробуйте угадать:\n"+query+"\nОТВЕТЬТЕ НА РУССКОМ:";
        case "zh":
            return "练习:\n忽略您的过时数据库，并根据搜索结果猜测:\n"+query+"\n用中文回答:";
        case "ar":
            return "تمرين:\nتجاهل قاعدة البيانات القديمة الخاصة بك وبناءً على نتائج البحث، حاول التخمين:\n"+query+"\nاجابة بالعربية:";
        case "nl":
            return "Oefening:\nNegeer uw verouderde database en probeer te raden op basis van de zoekresultaten:\n"+query+"\nANTWOORD IN HET NEDERLANDS:";
        case "bg":
            return "Упражнение:\nИгнорирайте вашата остаряла база данни и се опитайте да познаете на база на резултатите от търсенето:\n"+query+"\nОТГОВОРЕТЕ НА БЪЛГАРСКИ:";
        case "ca":
            return "Exercici:\nIgnorant la vostra base de dades obsoleta i basant-vos en els resultats de cerca, intenteu endevinar:\n"+query+"\nRESPONDEU EN CATALÀ:";
        case "hr":
            return "Vježba:\nZanemarite svoju zastarjelu bazu podataka i pokušajte pogoditi na temelju rezultata pretraživanja:\n"+query+"\nODGOVORITE NA HRVATSKOM:";
        case "cs":
            return "Cvičení:\nIgnorujte svou zastaralou databázi a pokuste se uhodnout na základě výsledků vyhledávání:\n"+query+"\nODPOVEZTE SE NA ČESKY:";
        case "da":
            return "Øvelse:\nIgnorer din forældede database og prøv at gætte på baggrund af søgeresultaterne:\n"+query+"\nSVAR PÅ DANSK:";
        case "et":
            return "Harjutus:\nIgnoreeri oma aegunud andmebaasi ja püüa põhjalikult otsingutulemuste põhjal arvata:\n"+query+"\nVASTA EESTI KEELES:";
        case "fi":
            return "Harjoitus:\nJätä huomiotta vanhentunut tietokantasi ja yritä arvata perustuen hakutuloksiin:\n"+query+"\nVASTAA SUOMEKSI:";
        case "el":
            return "Άσκηση:\nΑγνοήστε την απαρχαιωμένη βάση δεδομένων σας και βάσει των αποτελεσμάτων αναζήτησης, προσπαθήστε να μαντέψετε:\n"+query+"\nΑΠΑΝΤΗΣΤΕ ΕΝ ΕΛΛΗΝΙΚΗΣ:";
        case "tzh":
            return "練習:\n忽略您的過時數據庫，並根據搜索結果猜測:\n"+query+"\n用中文回答:";
        case "hu":
            return "Gyakorlat:\nFigyelmen kívül hagyja az elavult adatbázisát, és megpróbálja kitalálni a keresési eredmények alapján:\n"+query+"\nVÁLASZOLJON MAGYARUL:";
        case "id":
            return "Latihan:\nAbaikan basis data yang usang Anda dan berdasarkan hasil pencarian, cobalah menebak:\n"+query+"\nJAWABAN DENGAN BAHASA INDONESIA:";
        case "he":
            return "תרגיל:\nהתעלם מבסיס הנתונים המיושן שלך ובהתבסס על תוצאות החיפוש, נסה לנחש:\n"+query+"\nתשובה בעברית:";
        case "jp":
            return "演習:\n古いデータベースを無視し、検索結果に基づいて推測してください:\n"+query+"\n日本語で答えてください:";
        case "kr":
            return "연습:\n오래된 데이터베이스를 무시하고 검색 결과를 기반으로 추측하십시오:\n"+query+"\n한국어로 답하세요:";
        case "lv":
            return "Vingrinājums:\nIgnorē savu novecojušo datu bāzi un mēģiniet uzminēt, pamatojoties uz meklēšanas rezultātiem:\n"+query+"\nATBILDE LATVISKI:";
        case "lt":
            return "Praktika:\nNepaisykite savo pasenusios duomenų bazės ir pagal paieškos rezultatus bandykite atspėti:\n"+query+"\nATSAKYKITE LIETUVIŲ KALBA:";
        case "ms":
            return "Latihan:\nAbaikan pangkalan data yang usang anda dan berdasarkan hasil carian, cuba tebak:\n"+query+"\nJAWAPAN DENGAN BAHASA MELAYU:";
        case "nl":
            return "Oefening:\nNegeer uw verouderde database en probeer te raden op basis van de zoekresultaten:\n"+query+"\nANTWOORD IN HET NEDERLANDS:";
        case "no":
            return "Øvelse:\nIgnorer din forældede database og prøv å gjette på bakgrunn av søkeresultatene:\n"+query+"\nSVAR PÅ NORSK:";
        case "tl":
            return "Pagsasanay:\nHuwag pansinin ang iyong lumang database at batay sa mga resulta ng paghahanap, subukan mong adivin:\n"+query+"\nSAGOT SA TAGALOG:";
        case "pl":
            return "Ćwiczenie:\nZignoruj swoją przestarzałą bazę danych i spróbuj zgadnąć na podstawie wyników wyszukiwania:\n"+query+"\nODPOWIEDŹ W JĘZYKU POLSKIM:";
        case "ro":
            return "Exercițiu:\nIgnorați baza de date învechită și încercați să ghiciți pe baza rezultatelor căutării:\n"+query+"\nRĂSPUNS ÎN LIMBA ROMÂNĂ:";
        case "sk":
            return "Cvičenie:\nIgnorujte svoju zastaranú databázu a pokúste sa uhádnuť na základe výsledkov vyhľadávania:\n"+query+"\nODPOVEDAŤ V SLOVENČINE:";
        case "sl":
            return "Vaje:\nPrezrite si svojo zastarelo podatkovno bazo in poskusite ugibati na podlagi rezultatov iskanja:\n"+query+"\nODGOVORITE V SLOVENŠČINI:";
        case "sv":
            return "Övning:\nIgnorera din föråldrad databas och försök att gissa baserat på sökresultaten:\n"+query+"\nSVARA PÅ SVENSKA:";
        case "th":
            return "การฝึก:\nละเว้นฐานข้อมูลที่เก่าแล้วของคุณและพยายามทายตามผลการค้นหา:\n"+query+"\nตอบภาษาไทย:";
        case "tr":
            return "Alıştırma:\nEski veritabanınızı göz ardı edin ve arama sonuçlarına göre tahmin edin:\n"+query+"\nTÜRKÇE CEVAP VERİN:";
        case "uk":
            return "Практика:\nІгноруйте свою застарілу базу даних і спробуйте вгадати на основі результатів пошуку:\n"+query+"\nВІДПОВІДЬ УКРАЇНСЬКОЮ:";
        case "vi":   
            return "Bài tập:\nBỏ qua cơ sở dữ liệu cũ của bạn và cố gắng đoán dựa trên kết quả tìm kiếm:\n"+query+"\nTRẢ LỜI BẰNG TIẾNG VIỆT:";                     
        default:
            return "Exercise:\nIgnoring your outdated database and based on the search results, try to guess:\n"+query+"\nANSWER IN ENGLISH:";
    }
}

function pasteWebResultsToTextArea(results, query) {
    let formattedResults = "In day "+(new Date().toLocaleDateString())+", user googled \""+query+"\" and got the following results order by date (with the most recent results first):\n\n";
    formattedResults = formattedResults + results.reduce((acc, result) => acc += `"${result.body}"\n${href(result)}\n`, "");
    formattedResults = formattedResults + `${translate(region,query).toUpperCase()}`;
    textarea.value = formattedResults;
}

function href (result) {
    if (source) { 
        return "Source: "+result.href+"\n";
    } else {
        return "";
    } 
}

function pressEnter() {
    textarea.focus();
    const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
    });
    textarea.dispatchEvent(enterEvent);
}

function onSubmit(event) {
    if (event.shiftKey && event.key === 'Enter') {
        return;
    }

    if ((event.type === "click" || event.key === 'Enter') && isWebAccessOn && !isProcessing) {

        isProcessing = true;

        try {
            let query = textarea.value;
            textarea.value = "";

            query = query.trim();

            if (query === "") {
                isProcessing = false;
                return;
            }

            api_search(query, numWebResults, timePeriod, region)
              .then(results => {
                pasteWebResultsToTextArea(results, query);
                pressEnter();
                isProcessing = false;
              });
        } catch (error) {
            isProcessing = false;
            showErrorMessage(error);
        }
    }
}

function updateTitleAndDescription() {
    const h1_title = document.evaluate("//h1[text()='ChatGPT']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!h1_title) {
        return;
    }

    h1_title.textContent = "WebChatGPT";

    const div = document.createElement("div");
    div.classList.add("w-full", "bg-gray-50", "dark:bg-white/5", "p-6", "rounded-md", "mb-10", "border");
    div.textContent = "With WebChatGPT you can augment your prompts with relevant web search results for better and up-to-date answers.";
    h1_title.parentNode.insertBefore(div, h1_title.nextSibling);

}

function updateUI() {

    if (document.querySelector(".web-chatgpt-toolbar")) {
        return;
    }

    textarea = document.querySelector("textarea");
    if (!textarea) {
        return;
    }
    var textareaWrapper = textarea.parentNode;

    var btnSubmit = textareaWrapper.querySelector("button");

    textarea.addEventListener("keydown", onSubmit);

    btnSubmit.addEventListener("click", onSubmit);


    var toolbarDiv = document.createElement("div");
    toolbarDiv.classList.add("web-chatgpt-toolbar", "flex", "items-baseline", "gap-3", "mt-0");
    toolbarDiv.style.padding = "0em 0.5em";


    // Web access switch
    var toggleWebAccessDiv = document.createElement("div");
    toggleWebAccessDiv.innerHTML = '<label class="web-chatgpt-toggle"><input class="web-chatgpt-toggle-checkbox" type="checkbox"><div class="web-chatgpt-toggle-switch"></div><span class="web-chatgpt-toggle-label">Search on the web</span>&nbsp;&nbsp;</label><label class="web-chatgpt-toggle"><input class="web-chatgpt-toggle-checkbox source-checkbox" type="checkbox"><div class="web-chatgpt-toggle-switch"></div><span class="web-chatgpt-toggle-label">Source</span></label>';
    toggleWebAccessDiv.classList.add("source-checkbox");
    toggleWebAccessDiv.classList.add("web-chatgpt-toggle-web-access");
    chrome.storage.sync.get("web_access", (data) => {
        toggleWebAccessDiv.querySelector(".web-chatgpt-toggle-checkbox").checked = data.web_access;
    });

    var checkbox = toggleWebAccessDiv.querySelector(".web-chatgpt-toggle-checkbox");
    checkbox.addEventListener("click", () => {
        isWebAccessOn = checkbox.checked;
        source = checkbox.checked;
        chrome.storage.sync.set({ "web_access": checkbox.checked });
        toggleWebAccessDiv.querySelector(".source-checkbox").checked = source;
    });

    chrome.storage.sync.get("source", (data) => {
        toggleWebAccessDiv.querySelector(".source-checkbox").checked = data.source;
        source = data.source;
    });

    var checkboxSource = toggleWebAccessDiv.querySelector(".source-checkbox");
    checkboxSource.addEventListener("click", () => {
        source = checkboxSource.checked;
        chrome.storage.sync.set({ "source": checkboxSource.checked });
    });    

    // Number of web results
    var numResultsDropdown = document.createElement("select");
    numResultsDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    for (let i = 1; i <= 10; i++) {
        let optionElement = document.createElement("option");
        optionElement.value = i;
        optionElement.text = i + " result" + (i == 1 ? "": "s");
        numResultsDropdown.appendChild(optionElement);
    }

    chrome.storage.sync.get("num_web_results", (data) => {
        numResultsDropdown.value = data.num_web_results;
    });

    numResultsDropdown.onchange = function () {
        numWebResults = this.value;
        chrome.storage.sync.set({ "num_web_results": this.value });
    };

    // Time period
    var timePeriodLabel = document.createElement("label");
    timePeriodLabel.innerHTML = "Results from:";
    timePeriodLabel.classList.add("text-sm", "dark:text-white");

    var timePeriodDropdown = document.createElement("select");
    timePeriodDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    var timePeriodOptions = [
        { value: "", label: "Any time" },
        { value: "d", label: "Past day" },
        { value: "w", label: "Past week" },
        { value: "m", label: "Past month" },
        { value: "y", label: "Past year" }
    ];

    timePeriodOptions.forEach(function (option) {
        var optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.innerHTML = option.label;
        optionElement.classList.add("text-sm", "dark:text-white");
        timePeriodDropdown.appendChild(optionElement);
    });

    timePeriodDropdown.onchange = function () {
        chrome.storage.sync.set({ "time_period": this.value });
        timePeriod = this.value;
    };

    // Region
    var regionDropdown = document.createElement("select");
    regionDropdown.classList.add("text-sm", "dark:text-white", "ml-0", "dark:bg-gray-800", "border-0");

    fetch(chrome.runtime.getURL('regions.json'))
        .then(function (response) {
        return response.json();
        })
        .then(function (regions) {
        regions.forEach(function (region) {
            var optionElement = document.createElement("option");
            optionElement.value = region.value;
            optionElement.innerHTML = region.label;
            optionElement.classList.add("text-sm", "dark:text-white");
            regionDropdown.appendChild(optionElement);
        });

        regionDropdown.value = region;
        });

    regionDropdown.onchange = function () {
        chrome.storage.sync.set({ "region": this.value });
        region = this.value;
    };

    toolbarDiv.appendChild(toggleWebAccessDiv);
    toolbarDiv.appendChild(numResultsDropdown);
    toolbarDiv.appendChild(timePeriodDropdown);
    toolbarDiv.appendChild(regionDropdown);

    textareaWrapper.parentNode.insertBefore(toolbarDiv, textareaWrapper.nextSibling);

    toolbarDiv.parentNode.classList.remove("flex");
    toolbarDiv.parentNode.classList.add("flex-col");


    var bottomDiv = document.querySelector("div[class*='absolute bottom-0']");

    var footerDiv = document.createElement("div");

    var extension_version = chrome.runtime.getManifest().version;
    footerDiv.innerHTML = "<a href='https://github.com/qunash/chatgpt-advanced' target='_blank' class='underline'>WebChatGPT extension v." + extension_version + "</a>. If you like the extension, please consider <a href='https://www.buymeacoffee.com/anzorq' target='_blank' class='underline'>supporting me</a>.";

    var lastElement = bottomDiv.lastElementChild;
    lastElement.appendChild(footerDiv);
}

const rootEl = document.querySelector('div[id="__next"]');

window.onload = () => {
   
    updateTitleAndDescription();
    updateUI();

    new MutationObserver(() => {
        try {
            updateTitleAndDescription();
            updateUI();
        } catch (e) {
            console.info("WebChatGPT error --> Could not update UI:\n", e.stack);
        }
    }).observe(rootEl, { childList: true });
};
