import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess
from tkinter import messagebox, simpledialog
from PIL import Image, ImageTk

class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
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
        super().__init__(parent)
        label = tk.Label(self, text="Welcome to the Installation Wizard!")
        label.pack(pady=10, padx=10, anchor='center')
        button = tk.Button(self, text="Next", command=lambda: controller.show_frame(TermsPage))
        button.pack(anchor='center')

class TermsPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.text = tk.Text(self, width=80, height=20)
        self.text.pack(padx=5, pady=5)
        self.terms_accepted = tk.BooleanVar()
        self.accept_button = tk.Checkbutton(self, text="I accept the Terms and Conditions", variable=self.terms_accepted, command=self.toggle_next_button)
        self.accept_button.pack()
        self.next_button = tk.Button(self, text="Next", state='disabled', command=lambda: controller.show_frame(InstallPage))
        self.next_button.pack(pady=10)
        self.load_terms()

    def toggle_next_button(self):
        if self.terms_accepted.get():
            self.next_button.config(state='normal')
        else:
            self.next_button.config(state='disabled')

    def load_terms(self):
        url = "https://raw.githubusercontent.com/melaninsolar/melaninclick/main/melanin_click_terms_of_use.md"
        try:
            with urllib.request.urlopen(url) as response:
                html = response.read().decode()
        except urllib.error.URLError:
            html = "Failed to load Terms and Conditions. Please check your internet connection and try again."
        self.text.insert('end', html)
        self.text.config(state='disabled')

class InstallPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.output = tk.Text(self, state='disabled', width=70, height=20)
        self.output.pack(padx=5, pady=5)
        frame = tk.Frame(self)
        frame.pack(pady=20, padx=20)

        self.install_bitcoin_button = tk.Button(frame, text="Install Bitcoin Core", command=lambda: threading.Thread(target=self.check_storage_and_install_bitcoin).start())
        self.install_bitcoin_button.grid(row=0, column=0, padx=10, pady=5)
        self.run_mainnet_button = tk.Button(frame, text="Run Full Bitcoin Node", state='disabled', command=self.run_mainnet)
        self.run_mainnet_button.grid(row=0, column=1, padx=10, pady=5)
        self.run_pruned_node_button = tk.Button(frame, text="Run Pruned Bitcoin Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=0, column=2, padx=10, pady=5)
        self.run_bitcoin_sv2_button = tk.Button(frame, text="Run Bitcoin SV2 Miner", state='disabled')
        self.run_bitcoin_sv2_button.grid(row=1, column=1, padx=10, pady=5)
        
        separator1 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator1.grid(row=2, columnspan=3, pady=10, sticky='ew')

        self.install_whive_button = tk.Button(frame, text="Install Whive Core", command=lambda: threading.Thread(target=self.install_whive).start())
        self.install_whive_button.grid(row=3, column=0, padx=10, pady=5)
        self.run_whive_button = tk.Button(frame, text="Run Whive Core", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=3, column=1, padx=10, pady=5)
        self.miner_button = tk.Button(frame, text="Run Whive Miner", command=self.run_whive_miner)
        self.miner_button.grid(row=3, column=2, padx=10, pady=5, columnspan=3)

        separator2 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator2.grid(row=5, columnspan=3, pady=10, sticky='ew')

        self.miner_button = tk.Button(frame, text="Run Whive SV2 Miner", state='disabled')
        self.miner_button.grid(row=5, column=0, padx=10, pady=5, columnspan=3)

        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=6, column=0, padx=10, pady=5, columnspan=3)
        self.quit_button = tk.Button(frame, text="Quit", command=self.controller.quit)
        self.quit_button.grid(row=7, column=0, padx=10, pady=5, columnspan=3)

    def check_storage_and_install_bitcoin(self):
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)  # free space in GB
        if free_space > 600:
            threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz")).start()
        elif free_space > 10:
            self.update_output("Not enough space for full node, installing pruned node instead.")
            threading.Thread(target=self.install_pruned_bitcoin).start()
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def install_pruned_bitcoin(self):
        self.install('bitcoin-pruned', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz")
        self.run_pruned_node()

    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")
        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")
        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Downloading {software} from {download_url}")
        urllib.request.urlretrieve(download_url, downloaded_file)
        self.update_output("Extracting tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)
        self.update_output(f"{software} installation complete!")
        self.after(0, self.enable_buttons, software)

    def enable_buttons(self, software):
        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software.startswith('bitcoin'):
            self.run_mainnet_button.config(state='normal')
            self.run_pruned_node_button.config(state='normal')

    def run_mainnet(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        self.run_software(bitcoin_path)

    def run_pruned_node(self):
        pruned_data_dir = os.path.join(os.path.expanduser('~'), "bitcoin-pruned-node")
        bitcoin_path = os.path.join(pruned_data_dir, "bitcoin-22.0", "bin", "bitcoin-qt")
        if os.path.exists(bitcoin_path):
            command = [bitcoin_path, f'--datadir={pruned_data_dir}']
            self.run_software(*command)
        else:
            self.update_output("Error: Could not find the pruned Bitcoin node installation. Please install first.")

    def install_whive(self):
        threading.Thread(target=self.install, args=('whive', "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-x86_64-linux-gnu.tar.gz")).start()

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.run_software(whive_path)

    def run_whive_miner(self):
        # Display the disclaimer
        disclaimer_text = ("Running the CPU miner can significantly affect your computer's performance and longevity. "
                           "Do you want to continue?")
        response = msgbox.askyesno("Disclaimer", disclaimer_text)
        if not response:
            return  # User chose not to proceed

        # Prompt for Whive address
        whive_address = simpledialog.askstring("Whive Address", "Please enter your Whive address:")
        if not whive_address:
            msgbox.showerror("Error", "You must enter a valid Whive address to continue.")
            return

        self.update_output(f"Starting miner with Whive address: {whive_address}")
        threading.Thread(target=self.download_and_start_miner, args=(whive_address,)).start()

    def download_and_start_miner(self, address):
        miner_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-linux-5.0.40.tar.gz"
        miner_path = os.path.join(os.path.expanduser('~'), 'cpuminer-opt-linux')
        os.makedirs(miner_path, exist_ok=True)
        tar_path = os.path.join(miner_path, 'cpuminer-opt-linux.tar.gz')

        # Download and extract miner
        self.update_output("Downloading and extracting miner...")
        urllib.request.urlretrieve(miner_url, tar_path)
        with tarfile.open(tar_path, "r:gz") as tar:
            tar.extractall(path=miner_path)
        os.remove(tar_path)

        # Construct and run the miner command
        executable = os.path.join(miner_path, 'cpuminer')  # Adjust based on actual executable name within the tar
        cmd = [executable, "-a", "yespower", "-o", "stratum+tcp://206.189.2.17:3333", "-u", f"{address}.w1", "-t", "2"]
        self.run_software(*cmd)

    def run_software(self, *args):
        self.update_output(f"Running command: {' '.join(args)}")
        try:
            subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            self.update_output("Miner started successfully.")
        except Exception as e:
            self.update_output(f"Failed to start miner: {str(e)}")

    def display_help(self):
        help_text = "Help Section: \nUse this application to install and manage Bitcoin, Lightning, and Whive software.\nFor more information, visit [Website URL]."
        self.update_output(help_text)

    def update_output(self, message):
        self.output.config(state='normal')
        self.output.insert('end', message + "\n")
        self.output.config(state='disabled')
        self.output.see('end')

app = Application()
app.mainloop()
