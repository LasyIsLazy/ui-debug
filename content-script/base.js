;(() => {
    if (window.isInit) {
        return
    }

    const createDebugEl = (
        { url, name } = {
            url: '',
            name: '',
        }
    ) => {
        const targeEl = document.createElement('div')
        targeEl.id = 'ui-diff-el'

        const img = document.createElement('img')
        img.src = url
        targeEl.appendChild(img)
        img.style.width = '100%'
        img.style.position = 'relative'
        img.dataset.name = name

        const currentStyle = {
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            zIndex: '-1',
            opacity: '0.5',
        }
        Object.keys(currentStyle).forEach((key) => {
            const val = currentStyle[key]
            targeEl.style[key] = val
        })

        const opacity = 0.5
        let appended = false
        const append = () => {
            if (appended) {
                return
            }
            for (const el of document.body.children) {
                el.style.opacity = opacity
            }
            document.body.append(targeEl)
            appended = true
        }
        const destroy = () => {
            targeEl.remove()
            for (const el of document.body.children) {
                el.style.opacity = ''
            }
        }
        const setStyle = (style = {}) => {
            currentStyle = {
                ...currentStyle,
                ...style,
            }
            Object.keys(style).forEach((key) => {
                const val = style[key]
                targeEl.style[key] = val
            })
        }

        const setImgStyle = (style = {}) => {
            Object.keys(style).forEach((key) => {
                const val = style[key]
                img.style[key] = val
            })
        }

        const getImgStyle = () => {
            return img.style
        }

        const getImgName = () => {
            return img.dataset.name
        }

        const clear = () => {
            targeEl.remove()
            for (const el of document.body.children) {
                el.style.opacity = ''
            }
        }

        return {
            el: targeEl,
            append,
            destroy,
            setStyle,
            setImgStyle,
            getImgStyle,
            getImgName,
            clear,
        }
    }

    /** @type ReturnType<createDebugEl> */
    let elControl

    chrome.runtime.onMessage.addListener(
        async ({ command, args }, sender, sendResponse) => {
            // console.log({ command, args });
            let res = {}
            switch (command) {
                case 'append': {
                    const { url, name } = args
                    elControl = createDebugEl({ url, name })
                    elControl.append()
                    break
                }

                case 'setImgStyle': {
                    const { top, left, width } = args
                    elControl.setImgStyle({
                        top: `${top}px`,
                        left: `${left}px`,
                        width: `${width}%`,
                    })
                    break
                }

                case 'getImgInfo': {
                    const { top, left, width } = elControl?.getImgStyle() ?? {}
                    const name = elControl?.getImgName() ?? ''
                    res = {
                        name,
                        top: parseInt(top) || 0,
                        left: parseInt(left) || 0,
                        width: parseInt(width) || 100,
                    }
                    break
                }

                case 'isReady': {
                    res = elControl?.el.parentElement === document.body
                    break
                }

                case 'clear': {
                    elControl?.clear()
                }

                default:
                    break
            }
            sendResponse(res)
        }
    )
    window.isInit = true
})()
