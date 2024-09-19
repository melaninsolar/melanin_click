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

        # Section titles
        tk.Label(frame, text="BITCOIN CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=0, column=0, columnspan=1, pady=10)

        self.install_bitcoin_button = tk.Button(frame, text="STEP 1: Install Bitcoin Core Wallet", command=lambda: threading.Thread(target=self.install_bitcoin).start())
        self.install_bitcoin_button.grid(row=1, column=0, padx=10, pady=5, sticky="w")

        self.run_mainnet_button = tk.Button(frame, text="STEP 2: Run Bitcoin Wallet & Full Node", state='disabled', command=self.run_mainnet)
        self.run_mainnet_button.grid(row=2, column=0, padx=10, pady=5, sticky="w")

        self.run_miner_button = tk.Button(frame, text="STEP 3: Run Bitcoin Pool Miner (SV1)", state='disabled', command=self.run_bitcoin_miner)
        self.run_miner_button.grid(row=3, column=0, padx=10, pady=5, sticky="w")

        self.run_pruned_node_button = tk.Button(frame, text="STEP 4: Run Pruned Bitcoin Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=4, column=0, padx=10, pady=5, sticky="w")

        separator1 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator1.grid(row=5, columnspan=1, pady=10, sticky='ew')

        tk.Label(frame, text="WHIVE CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=6, column=0, columnspan=1, pady=10)

        self.install_whive_button = tk.Button(frame, text="STEP 1: Install Whive Core Wallet", command=lambda: threading.Thread(target=self.install_whive).start())
        self.install_whive_button.grid(row=7, column=0, padx=10, pady=5, sticky="w")

        self.run_whive_button = tk.Button(frame, text="STEP 2: Run Whive Wallet & Full Node", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=8, column=0, padx=10, pady=5, sticky="w")

        self.run_whive_miner_button = tk.Button(frame, text="STEP 3: Run Whive Pool Miner (SV1)", state='disabled', command=self.run_whive_miner)
        self.run_whive_miner_button.grid(row=9, column=0, padx=10, pady=5, sticky="w")

        separator2 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator2.grid(row=10, columnspan=1, pady=10, sticky='ew')

        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=11, column=0, padx=10, pady=5, sticky="w")

        self.quit_button = tk.Button(frame, text="Quit", command=self.controller.quit)
        self.quit_button.grid(row=12, column=0, padx=10, pady=5, sticky="w")

    def install_bitcoin(self):
        self.update_output("Installing Bitcoin Core... This process may take 1-2 minutes, please be patient.")
        install_path = os.path.join(os.path.expanduser('~'), "bitcoin-core")
        downloaded_file = os.path.join(install_path, "bitcoin.tar.gz")
        os.makedirs(install_path, exist_ok=True)

        download_url = "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz"
        urllib.request.urlretrieve(download_url, downloaded_file)

        self.update_output("Extracting Bitcoin Core tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)

        self.update_output("BITCOIN CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL BITCOIN NODE (STEP 2)\n - RUN BITCOIN POOL MINER (STEP 3)")
        self.run_mainnet_button.config(state='normal')
        self.run_miner_button.config(state='normal')

    def install_whive(self):
        self.update_output("Installing Whive Core... This process may take 1-2 minutes, please be patient.")
        install_path = os.path.join(os.path.expanduser('~'), "whive-core")
        downloaded_file = os.path.join(install_path, "whive.tar.gz")
        os.makedirs(install_path, exist_ok=True)

        download_url = "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-x86_64-linux-gnu.tar.gz"
        urllib.request.urlretrieve(download_url, downloaded_file)

        self.update_output("Extracting Whive Core tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)

        self.update_output("WHIVE CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL WHIVE NODE (STEP 2)\n - RUN WHIVE POOL MINER (STEP 3)")
        self.run_whive_button.config(state='normal')
        self.run_whive_miner_button.config(state='normal')

    def run_mainnet(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        self.run_software(bitcoin_path)

    def run_pruned_node(self):
        pruned_data_dir = os.path.join(os.path.expanduser('~'), "bitcoin-pruned-node")
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        command = [bitcoin_path, f'--datadir={pruned_data_dir}', '--prune=550']
        self.run_software(*command)

    def run_bitcoin_miner(self):
        bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
        machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        minerd_path = os.path.expanduser('~/cpuminer-opt-linux/cpuminer')
        if not os.path.exists(minerd_path):
            self.update_output("Bitcoin miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-linux-5.0.40.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = f'{minerd_path} -a sha256d -o stratum+tcp://public-pool.io:21496 -u {bitcoin_address}.{machine_name} -p x'
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', cmd])
        self.update_output("Bitcoin mining process started in a new terminal window.")

    def run_whive_miner(self):
        whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        minerd_path = os.path.expanduser('~/cpuminer-opt-linux/cpuminer')
        if not os.path.exists(minerd_path):
            self.update_output("Whive miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-linux-5.0.40.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = f'{minerd_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {whive_address}.w1 -t 2'
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', cmd])
        self.update_output("Whive mining process started in a new terminal window.")

    def download_and_extract_miner(self, url):
        miner_path = os.path.expanduser('~/cpuminer-opt-linux')
        os.makedirs(miner_path, exist_ok=True)
        tar_path = os.path.join(miner_path, 'cpuminer-opt-linux.tar.gz')

        self.update_output("Downloading and extracting miner...")
        urllib.request.urlretrieve(url, tar_path)
        with tarfile.open(tar_path, "r:gz") as tar:
            tar.extractall(path=miner_path)
        os.remove(tar_path)

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.run_software(whive_path)

    def run_software(self, *args):
        self.update_output(f"Running: {' '.join(args)}")
        subprocess.Popen(args)

    def display_help(self):
        self.update_output("Help Section: Follow the steps in each section to install and run the wallets and miners for Bitcoin and Whive.")

    def update_output(self, message):
        self.output.config(state='normal')
        self.output.insert('end', message + "\n")
        self.output.config(state='disabled')
        self.output.see('end')


app = Application()
app.mainloop()
