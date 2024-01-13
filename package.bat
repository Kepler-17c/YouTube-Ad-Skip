@echo off
del build\youtube-ad-skip.xpi
if exist build\youtube-ad-skip.xpi (
    echo Can't update addon file.
    exit /B
)
7z a -x!*.bat -x!*.xpi -x!.* -x!build -tzip build\youtube-ad-skip.xpi *
