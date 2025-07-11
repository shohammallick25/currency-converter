// Import helper to map currency to country flags
import { currencyToFlagCode } from './currency-to-flag-code.js'

// Select elements from the DOM
const currencySelectElements = document.querySelectorAll('.currency-converter__select select');

const inputSourceCurrency = document.getElementById('inputSourceCurrency');

const imageSourceCurrency = document.getElementById('imageSourceCurrency');
const selectSourceCurrency = document.getElementById('selectSourceCurrency');

const buttonSwap = document.getElementById('buttonSwap');

const imageTargetCurrency = document.getElementById('imageTargetCurrency');
const selectTargetCurrency = document.getElementById('selectTargetCurrency');

const exchangeRateText = document.getElementById('exchangeRateText');

const buttonConvert = document.getElementById('buttonConvert');

// Declare variables
let isFetching = false;
let conversionRate = 0;

let sourceCurrencyValue = 0;
let targetCurrencyValue = 0;

// Swap source and target currencies
buttonSwap.addEventListener('click', () => {
    // Swap select values
    [selectSourceCurrency.value, selectTargetCurrency.value] = [selectTargetCurrency.value, selectSourceCurrency.value];

    // Swap country flags
    [imageSourceCurrency.src, imageTargetCurrency.src] = [imageTargetCurrency.src, imageSourceCurrency.src];

    // Swap conversion rate
    inputSourceCurrency.value = targetCurrencyValue;

    if (isFetching) {
        // Reverse conversion rate
        conversionRate = 1 / conversionRate;
    }

    updateExchangeRate();
});

// Update exchange rate upon input
inputSourceCurrency.addEventListener('input', (event) => {
    // Update exchange rate
    if (isFetching && inputSourceCurrency.value > 0) {
        updateExchangeRate();
    }
});

// Perform conversion when button is clicked
buttonConvert.addEventListener('click', async () => {
    // When input is less than or equal to 0
    if (inputSourceCurrency.value <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    exchangeRateText.textContent = 'Fetching exchange rate, please wait…'

    const selectSourceCurrencyValue = selectSourceCurrency.value;
    const selectTargetCurrencyValue = selectTargetCurrency.value;

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/3f7aef110c7cd47fc72854fe/pair/${selectSourceCurrencyValue}/${selectTargetCurrencyValue}`);
        const data = await response.json();

        conversionRate = data.conversion_rate;

        isFetching = true;
        updateExchangeRate();
    } catch (error) {
        console.error('Error fetching exchange rate!', error);
        exchangeRateText.textContent = 'Error fetching exchange rate!'
    }
});

// Update exchange rate displayed
function updateExchangeRate() {
    sourceCurrencyValue = parseFloat(inputSourceCurrency.value).toFixed(2);
    targetCurrencyValue = (sourceCurrencyValue * conversionRate).toFixed(2);

    exchangeRateText.textContent =
        `${formatCurrency(sourceCurrencyValue)} ${selectSourceCurrency.value} = 
        ${formatCurrency(targetCurrencyValue)} ${selectTargetCurrency.value}`;
}

// Change country flags upon select
function changeFlag(selectElement) {
    const selectValue = selectElement.value;
    const selectElementId = selectElement.id;
    const flagCode = currencyToFlagCode[selectValue]

    if (selectElementId === 'selectSourceCurrency') {
        imageSourceCurrency.src = `https://flagcdn.com/w640/${flagCode}.png`;
    } else if (selectElementId === 'selectTargetCurrency') {
        imageTargetCurrency.src = `https://flagcdn.com/w640/${flagCode}.png`;
    }
}

// Initialize select menus and flags
currencySelectElements.forEach(select => {
    // Fill options
    for (const [currency, flagCode] of Object.entries(currencyToFlagCode)) {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
    }

    // Listen for changes
    select.addEventListener('change', () => {
        inputSourceCurrency.value = 0;
        isFetching = false;
        updateExchangeRate();
        changeFlag(select);
    });

    // Set default select target value
    if (select.id === 'selectTargetCurrency') {
        select.value = 'BDT'
    }
});

// Format currency
function formatCurrency(number) {
    return new Intl.NumberFormat().format(number);
}