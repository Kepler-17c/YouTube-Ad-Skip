// settings
let intervalMs = 500;
let iconReplacerMaxAttempts = 10_000 / intervalMs;

// constants
let svgNamespace = 'http://www.w3.org/2000/svg';
let adDetectionSelector = 'div.video-ads.ytp-ad-module';
let muteButtonSelector = 'button.ytp-mute-button.ytp-button';
let skipButtonSelector = 'button.ytp-skip-ad-button';


class IconReplacer {
    static adSkipIconUrl = browser.runtime.getURL('resources/icon.svg');

    constructor (domQuery, action) {
        let attempts = 0;
        let interval = setInterval(
            () => {
                let domElement = document.querySelector(domQuery);
                if (domElement != null) {
                    clearInterval(interval);
                    action(domElement);
                }
                if (++attempts >= iconReplacerMaxAttempts) {
                    clearInterval(interval);
                }
            },
            intervalMs
        );
    }
}

function buildSvgIconElement () {
    let adSkipIcon = document.createElementNS(svgNamespace, 'image');
    adSkipIcon.setAttribute('x', '0');
    adSkipIcon.setAttribute('y', '0');
    adSkipIcon.setAttribute('width', '28.6');
    adSkipIcon.setAttribute('height', '20');
    adSkipIcon.setAttribute('href', IconReplacer.adSkipIconUrl);
    return adSkipIcon;
}

function buildImgIconElement () {
    let adSkipImage = document.createElement('img');
    adSkipImage.src = IconReplacer.adSkipIconUrl;
    adSkipImage.setAttribute('width', '100%');
    adSkipImage.setAttribute('height', '100%');
    return adSkipImage;
}

// replace the YouTube icons with ad-skip
new IconReplacer(
    // top-left corner (icon with text)
    '.external-icon>svg',
    (youtubeIcon) => {
        youtubeIcon.querySelector('g').remove();
        youtubeIcon.prepend(buildSvgIconElement());
    }
);
new IconReplacer(
    // play button centred on the video player
    'button.ytp-large-play-button.ytp-button',
    (playButton) => {
        let mutationCallback = () => {
            // only listening for childList changes, so no need to multiplex event
            playButton.querySelector('svg').remove();
            playButton.append(buildImgIconElement());
        };
        mutationCallback();
        new MutationObserver(
            mutationCallback
        ).observe(
            playButton,
            { childList: true }
        );
    }
);

function isPlayingAd () {
    let adContainer = document.querySelector(adDetectionSelector);
    if (!adContainer) {
        return false;
    }
    let adContainerStyles = window.getComputedStyle(adContainer).display;
    let isVisible = adContainerStyles == "none" || adContainerStyles == "hidden";
    return !isVisible;
}

function isSoundMuted () {
    return document.querySelector(muteButtonSelector).querySelector('clipPath') == null;
}

// start the skipping routine
setInterval(
    () => document.querySelector(skipButtonSelector)?.click(),
    intervalMs
);
// start ad mute routine
setInterval(
    () => {
        let muteButton = document.querySelector(muteButtonSelector);
        if (isPlayingAd()) {
            if (!isSoundMuted()) {
                muteButton.click();
            }
        } else {
            if (isSoundMuted()) {
                muteButton.click();
            }
        }
    },
    intervalMs
);
