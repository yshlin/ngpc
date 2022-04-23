function checkIn(idToken) {
    document.getElementById('gas').src = 'https://script.google.com/macros/s/AKfycbwhzzjSo_nx8st12ZtwB7CxZjMOBiO-Dm3AESLsncGKaViWe-S3rAbm-IluJnWJo9rH/exec?idToken=' + idToken;
}

function sayHi(profile) {
    document.getElementById('gas').textContent = profile.name;
}

document.addEventListener("DOMContentLoaded", function () {
    liff
        .init({liffId: process.env.LIFF_ID})
        .then(() => {
            console.log("Success! you can do something with LIFF API here.")
            if (!liff.isLoggedIn()) {
                liff.login();
            }
            checkIn(liff.getIDToken());
        })
        .catch((error) => {
            console.log(error)
        })
});
