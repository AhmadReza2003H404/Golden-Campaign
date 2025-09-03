function convertInputToPersianNumerals(input) {
    input.innerHTML = input.innerHTML.replace(/\d/g, function (digit) {
        return persianNumbers[digit];
    });
}

function limitToOneDigit(element) {
    if (element.innerText.length > 1) {
        element.innerText = element.innerText.charAt(0);
        // if (!/^\d$/.test(element.innerText)) {
        //     element.innerText = '0';
        // }
    }
}

function jumpToNext(element) {
    if (element.textContent.length === 1 && element.nextElementSibling && element.nextElementSibling.classList.contains('card')) {
        element.nextElementSibling.focus();
    }
}

function jumpToPrev(element) {
    if (element.textContent.length === 1 && element.previousElementSibling && element.previousElementSibling.classList.contains('card')) {
        element.previousElementSibling.focus();
    } else {
        element.blur();
        var x = document.getElementById("enterListener");
        x.focus();
    }
}

function convertPersianNumeralsToEnglish(persianNumerals) {
    const persianToEnglish = {
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
        '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    return persianNumerals.join('').split('').map(num => persianToEnglish[num] || num).join('');
}

const editableDiv = document.getElementById("enterListener");

editableDiv.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        confirm();
    }
    setTimeout(() => {
        editableDiv.innerText = "";
    }, 0);
});


function confirm() {
    const element = document.getElementById('body');
    element.className = 'blurBackgroundImg';
    let results = [];
    let chanceNumbers = document.querySelectorAll('.card');
    chanceNumbers.forEach(function (div) {
        results.push(div.textContent);
    });
    //results could be used
    reverseFixedNumber = convertPersianNumeralsToEnglish(results);
    fixedNumber = (reverseFixedNumber.split("").reverse().join("") - 1) % Math.floor(winners_size / WINNERS_COUNT);
    hideDiv('input');
    showDiv('winner');
    currentIndex = Number(fixedNumber);
    showWinners();
}

function addMemberDetails() {
    const el = document.createElement('p');
    el.className = 'stats-value';
    el.innerHTML = `${converNumberToPersianNumber(winners_size)}`;

    const el2 = document.createElement('p');
    el2.className = 'stats-value';
    el2.innerHTML = `${converNumberToPersianNumber(Math.floor(winners_size / WINNERS_COUNT))} - ۱`;

    const membersCount = document.getElementById('membersCount');
    membersCount.appendChild(el);
    const membersInterval = document.getElementById('membersInterval');
    membersInterval.appendChild(el2);

}

function readJsonFile() {
    fetch("output.json")
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(jsonData => {
            if (Array.isArray(jsonData)) {
                winners_size = jsonData.length;
                winners = jsonData;
            } else {
                console.log("Number of keys:", Object.keys(jsonData).length);
            }
            addMemberDetails();
        })
        .catch(err => {
            console.error("Error reading file:", err);
        });
}

function showWinners() {
    nextWinner();
}



window.onload = function () {
    document.querySelector('.cardFirst').focus();
    readJsonFile();
};
