const execCommand = async (command, args) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tab.id,
            {
                command,
                args,
            },
            {},
            (...args) => {
                console.log('res', ...args)
                resolve(...args)
            }
        )
    })
}

const fileInputEl = document.getElementById('fileInput')
const clearEl = document.getElementById('clear')
const picNameEl = document.getElementById('picName')
const clearBtnEl = document.getElementById('clearBtn')
const xInputEl = document.getElementById('x')
const yInputEl = document.getElementById('y')
const widthInputEl = document.getElementById('width')
const controlEl = document.getElementById('control')

const hide = (el) => {
    el.classList.add('hidden')
}

const show = (el) => {
    el.classList.remove('hidden')
}

const initInput = async () => {
    const ready = await execCommand('isReady')
    if (!ready) {
        return
    }
    const info = await execCommand('getImgInfo')
    const { name, top, left, width } = info
    yInputEl.value = top
    xInputEl.value = left
    widthInputEl.value = width
    show(controlEl)
    show(clearEl)
    hide(fileInputEl)
    picNameEl.innerText = name
}

chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
    console.log('exec', tab.id)
    const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script/base.js'],
    })
    console.log('exec done', res)
    initInput()
})

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
    })

fileInputEl.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) {
        return
    }
    const str = await toBase64(file)
    await execCommand('append', {
        url: str,
        name: file.name,
    })
    await initInput()
})

const handleImgPropChange = () => {
    const top = yInputEl.value
    const left = xInputEl.value
    const width = widthInputEl.value
    execCommand('setImgStyle', {
        top,
        left,
        width,
    })
}

yInputEl.addEventListener('change', handleImgPropChange)
xInputEl.addEventListener('change', handleImgPropChange)
widthInputEl.addEventListener('change', handleImgPropChange)

const clear = async () => {
    await execCommand('clear')
    hide(controlEl)
    hide(clearEl)
    fileInputEl.value = ''
    show(fileInputEl)
}
clearBtnEl.addEventListener('click', async () => {
    clear()
})
