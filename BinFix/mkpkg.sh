PKG=binfix
FILES="config.xml index.html icons includes"
rm -rf ${PKG}.oex && 7z a ${PKG}.zip ${FILES} && mv ${PKG}.zip ${PKG}.oex
