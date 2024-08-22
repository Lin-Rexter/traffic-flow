//'use client'
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";


export default function Modal_Dialog({hook, emailRef}) {
    const [openModal, setOpenModal] = hook
    const emailInputRef = emailRef

    return (
        <Modal show={openModal} size="md" position="center" popup onClose={() => setOpenModal(false)} initialFocus={emailInputRef}>
            <Modal.Header />
            <Modal.Body>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email" value="Your email" />
                        </div>
                        <TextInput id="email" ref={emailInputRef} placeholder="name@company.com" required />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password" value="Your password" />
                        </div>
                        <TextInput id="password" type="password" required />
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>
                        <a href="#" className="text-sm text-cyan-700 hover:underline dark:text-cyan-500">
                            Lost Password?
                        </a>
                    </div>
                    <div className="w-full">
                        <Button>Log in to your account</Button>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
                        Not registered?&nbsp;
                        <a href="#" className="text-cyan-700 hover:underline dark:text-cyan-500">
                            Create account
                        </a>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}