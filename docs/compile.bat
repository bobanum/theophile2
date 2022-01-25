cd /D "%~dp0/.."
REM using "call" to make pause work
call jsdoc . -c ./docs/conf.json
@pause