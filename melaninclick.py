import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess

class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)

        # Set the window title
        self.title("Melanin Click")

        self.container = tk.Frame(self)
        self.container.pack(side="top", fill="both", expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        self.frames = {}
        for F in (StartPage, TermsPage, InstallPage):
            frame = F(self.container, self)
            self.frames[F] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame(StartPage)

    def show_frame(self, page):
        frame = self.frames[page]
        frame.tkraise()

class StartPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)

        label = tk.Label(self, text="Welcome to the Installation Wizard!")
        label.pack(pady=10,padx=10)

        button = tk.Button(self, text="Next",
                           command=lambda: controller.show_frame(TermsPage))
        button.pack()

class TermsPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller

        self.text = tk.Text(self, width=80, height=20)
        self.text.pack(padx=5, pady=5)

        self.terms_accepted = tk.BooleanVar()
        self.accept_button = tk.Checkbutton(self, text="I accept the Terms and Conditions",
                                            variable=self.terms_accepted,
                                            command=self.toggle_next_button)
        self.accept_button.pack()

        self.next_button = tk.Button(self, text="Next", state='disabled',
                                     command=lambda: controller.show_frame(InstallPage))
        self.next_button.pack(pady=10)

        self.load_terms()

    def toggle_next_button(self):
        if self.terms_accepted.get():
            self.next_button.config(state='normal')
        else:
            self.next_button.config(state='disabled')

    def load_terms(self):
        url = "https://raw.githubusercontent.com/whiveio/whive/master/WHIVE_TERMS_AND_CONDITIONS.md"
        try:
            with urllib.request.urlopen(url) as response:
                html = response.read().decode()
        except urllib.error.URLError:
            html = "Failed to load Terms and Conditions. Please check your internet connection and try again."

        self.text.insert('end', html)
        self.text.config(state='disabled')

class InstallPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)

        self.output = tk.Text(self, state='disabled', width=70, height=15)
        self.output.pack(padx=5, pady=5)

        frame = tk.Frame(self)
        frame.pack(pady=20, padx=20)

        self.install_whive_button = tk.Button(frame, text="Install Whive", command=self.install_whive)
        self.install_whive_button.grid(row=0, column=0, padx=10)

        self.install_bitcoin_button = tk.Button(frame, text="Install Bitcoin", command=self.check_storage_and_install_bitcoin)
        self.install_bitcoin_button.grid(row=0, column=1, padx=10)

        self.run_whive_button = tk.Button(frame, text="Run Whive", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=0, column=2, padx=10)

        self.run_bitcoin_button = tk.Button(frame, text="Run Bitcoin", state='disabled', command=self.run_bitcoin)
        self.run_bitcoin_button.grid(row=0, column=3, padx=10)

        self.quit_button = tk.Button(frame, text="Quit", state='disabled', command=controller.quit)
        self.quit_button.grid(row=0, column=4, padx=10)

    def check_storage_and_install_bitcoin(self):
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)  # free space in GB

        if free_space > 600:
            self.install('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")
        elif free_space > 10:
            # You might need to adjust the link here if there's a different binary or configuration for regtest
            self.install('bitcoin-regtest', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def install_whive(self):
        self.install('whive', "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-osx64.tar.gz")

    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")

        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")

        # Create installation directory if it doesn't exist
        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Created installation directory at {install_path}")

        # Download the file
        self.update_output(f"Downloading {software} from {download_url}")
        urllib.request.urlretrieve(download_url, downloaded_file)

        # Extract the tarball and delete it
        self.update_output("Extracting tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)
        self.update_output(f"{software} installation complete!")
        
        # Enable the respective run buttons
        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software.startswith('bitcoin'):
            self.run_bitcoin_button.config(state='normal')

        self.quit_button.config(state='normal')

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.run_software(whive_path)

    def run_bitcoin(self):
        # Assuming the binary name is 'bitcoin-qt' for now
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        self.run_software(bitcoin_path)

    def run_software(self, software_path):
        self.update_output(f"Running software from {software_path}")
        subprocess.Popen([software_path])

    def update_output(self, message):
        self.output.config(state='normal')  # Enable text box
        self.output.insert('end', message + "\n")  # Insert new message
        self.output.config(state='disabled')  # Disable text box
        self.output.see('end')  # Scroll to end

app = Application()
app.mainloop()

