import { EventEmitter } from 'events'
import * as HID from 'node-hid'
import * as USB from 'usb'

export class UsbMonitor extends EventEmitter {
    public static readonly CHANGE_EVENT = 'change'
    private readonly _close: () => void

    constructor(readonly vendorId?: number, readonly productId?: number) {
        super()

        const handleAttach = (device: USB.Device) => {
            if (!this.isMatchedDevice(device.deviceDescriptor.idVendor, device.deviceDescriptor.idProduct)) {
                return
            }
            this.emit(UsbMonitor.CHANGE_EVENT)
        }
        const handleDetach = (device: USB.Device) => {
            if (!this.isMatchedDevice(device.deviceDescriptor.idVendor, device.deviceDescriptor.idProduct)) {
                return
            }
            this.emit(UsbMonitor.CHANGE_EVENT)
        }

        USB.on('attach', handleAttach)
        USB.on('detach', handleDetach)

        this._close = () => {
            USB.removeListener('attach', handleAttach)
            USB.removeListener('detach', handleDetach)
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
