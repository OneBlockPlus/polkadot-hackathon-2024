document.addEventListener("DOMContentLoaded", () => {
    const copyDIDButton = document.querySelector('.copy-btn button');
    const unlinkButtons = document.querySelectorAll('.unlink-btn');
    const copyKeyButtons = document.querySelectorAll('.copy-key');
    const removeKeyButtons = document.querySelectorAll('.remove-key');

    // Copy DID to clipboard
    copyDIDButton.addEventListener('click', () => {
        const didText = 'did:xenon:5GrwV...7dhw';
        navigator.clipboard.writeText(didText).then(() => {
            alert('DID copied to clipboard!');
        });
    });

    // Unlink chain
    unlinkButtons.forEach((button) => {
        button.addEventListener('click', () => {
            button.closest('.chain-item').remove();
        });
    });

    // Copy public key to clipboard
    copyKeyButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const keyText = button.closest('.key-item').querySelector('p').innerText;
            navigator.clipboard.writeText(keyText).then(() => {
                alert('Public key copied to clipboard!');
            });
        });
    });

    // Remove public key
    removeKeyButtons.forEach((button) => {
        button.addEventListener('click', () => {
            button.closest('.key-item').remove();
        });
    });
});

