import { EventEmitter } from 'events'
import * as HID from 'node-hid'
import * as USB from 'usb'

export class UsbMonitor extends EventEmitter {
    public static readonly CHANGE_EVENT = 'change'
    private readonly _close: () => void

    constructor(readonly vendorId?: number, readonly productId?: number) {
        super()

        let timer: any
        const emitChange = (device: USB.Device) => {
            if (!this.isMatchedDevice(device.deviceDescriptor.idVendor, device.deviceDescriptor.idProduct)) {
                return
            }

            // debounce
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                timer = undefined
                this.emit(UsbMonitor.CHANGE_EVENT)
            }, 500)
        }

        USB.on('attach', emitChange)
        USB.on('detach', emitChange)

        this._close = () => {
            USB.removeListener('attach', emitChange)
            USB.removeListener('detach', emitChange)
        }
    }

    public devices() {
        return HID.devices().filter(device => this.isMatchedDevice(device.vendorId, device.productId))
    }

    public close() { this._close() }

    private isMatchedDevice(vid: number, pid: number) {
        return (this.vendorId === undefined || this.vendorId === vid) &&
            (this.productId === undefined || this.productId === pid)
    }
}
