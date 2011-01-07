rm -rf binfix.oex && 7z a binfix.zip icons includes index.html config.xml && mv binfix.zip binfix.oex
PKG=binfix
FILES="config.xml index.html icons includes"
rm -rf ${PKG}.oex && 7z a ${PKG}.zip ${FILES} && mv ${PKG}.zip ${PKG}.oex
