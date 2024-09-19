import tkinter as tk
import os
import urllib.request
import zipfile
import threading
import subprocess
from tkinter import simpledialog, messagebox
import requests
import psutil


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
        label.pack(pady=10, padx=10, anchor='center')

        button = tk.Button(self, text="Next", command=lambda: controller.show_frame(TermsPage))
        button.pack(anchor='center')


class TermsPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
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
        tk.Frame.__init__(self, parent)

        self.output = tk.Text(self, state='disabled', width=70, height=20)
        self.output.pack(padx=5, pady=5)

        frame = tk.Frame(self)
        frame.pack(pady=20, padx=20)

        # Section Titles
        tk.Label(frame, text="BITCOIN CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=0, column=0, pady=10)

        # Bitcoin Core Installation
        self.install_bitcoin_button = tk.Button(frame, text="STEP 1: Install Bitcoin Core Wallet", command=self.install_bitcoin)
        self.install_bitcoin_button.grid(row=1, column=0, padx=10, pady=5, sticky="w")

        # Run Full Bitcoin Core
        self.run_mainnet_button = tk.Button(frame, text="STEP 2: Run Bitcoin Wallet & Full Node", state='disabled', command=self.run_mainnet)
        self.run_bitcoin_button.grid(row=2, column=0, padx=10, pady=5, sticky="w")

        # Run Bitcoin Miner
        self.connect_public_pool_button = tk.Button(frame, text="STEP 3: Run Bitcoin Pool Miner (SV1)", state='disabled', command=self.run_bitcoin_miner)
        self.connect_public_pool_button.grid(row=3, column=0, padx=10, pady=5, sticky="w")

        # Run Pruned Bitcoin Node
        self.run_pruned_node_button = tk.Button(frame, text="STEP 4: Run Pruned Bitcoin Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=4, column=0, padx=10, pady=5, sticky="w")

        separator1 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator1.grid(row=5, columnspan=1, pady=10, sticky='ew')

        tk.Label(frame, text="WHIVE CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=6, column=0, pady=10)

        # Whive Core Installation
        self.install_whive_button = tk.Button(frame, text="STEP 1: Install Whive Core Wallet", command=self.install_whive)
        self.install_whive_button.grid(row=7, column=0, padx=10, pady=5, sticky="w")

        # Run Full Whive Node
        self.run_whive_button = tk.Button(frame, text="STEP 2: Run Whive Wallet & Full Node", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=8, column=0, padx=10, pady=5, sticky="w")

        # Run Whive Miner
        self.run_cpuminer_button = tk.Button(frame, text="STEP 3: Run Whive Pool Miner (SV1)", state='disabled', command=self.run_whive_miner)
        self.run_cpuminer_button.grid(row=9, column=0, padx=10, pady=5, sticky="w")

        separator2 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator2.grid(row=10, columnspan=1, pady=10, sticky='ew')

        # Help and Quit buttons
        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=11, column=0, padx=10, pady=5, sticky="w")

        self.quit_button = tk.Button(frame, text="Quit", command=controller.quit)
        self.quit_button.grid(row=12, column=0, padx=10, pady=5, sticky="w")

    def install_bitcoin(self):
        self.update_output("Installing Bitcoin Core... This process may take 1-2 minutes, please be patient.")
        install_path = os.path.join(os.path.expanduser('~'), "bitcoin-core")
        downloaded_file = os.path.join(install_path, "bitcoin.zip")
        os.makedirs(install_path, exist_ok=True)

        download_url = "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-win64.zip"
        urllib.request.urlretrieve(download_url, downloaded_file)

        self.update_output("Extracting Bitcoin Core zip file...")
        with zipfile.ZipFile(downloaded_file, 'r') as zip_ref:
            zip_ref.extractall(path=install_path)
        os.remove(downloaded_file)

        self.update_output("BITCOIN CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL BITCOIN NODE (STEP 2)\n - RUN BITCOIN POOL MINER (STEP 3)")
        self.run_bitcoin_button.config(state='normal')
        self.connect_public_pool_button.config(state='normal')

    def install_whive(self):
        self.update_output("Installing Whive Core... This process may take 1-2 minutes, please be patient.")
        install_path = os.path.join(os.path.expanduser('~'), "whive-core")
        downloaded_file = os.path.join(install_path, "whive.zip")
        os.makedirs(install_path, exist_ok=True)

        download_url = "https://github.com/whiveio/whive_releases/releases/download/22.2.3/whive-22.2.3-win64.zip"
        urllib.request.urlretrieve(download_url, downloaded_file)

        self.update_output("Extracting Whive Core zip file...")
        with zipfile.ZipFile(downloaded_file, 'r') as zip_ref:
            zip_ref.extractall(path=install_path)
        os.remove(downloaded_file)

        self.update_output("WHIVE CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL WHIVE NODE (STEP 2)\n - RUN WHIVE POOL MINER (STEP 3)")
        self.run_whive_button.config(state='normal')
        self.run_cpuminer_button.config(state='normal')

    def run_bitcoin(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        if os.path.exists(bitcoin_path):
            self.run_software(bitcoin_path)
        else:
            self.update_output("Bitcoin software not found. Please install first.")

    def run_whive(self):
        """Run Whive Core on Windows."""
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt.exe")
        if os.path.exists(whive_path):
            self.run_software(whive_path)
        else:
            self.update_output("Whive software not found. Please install first.")

    def run_pruned_node(self):
        pruned_data_dir = os.path.join(os.path.expanduser('~'), "pruned-bitcoin")
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        
        if not os.path.exists(pruned_data_dir):
            os.makedirs(pruned_data_dir)
        bitcoin_conf_path = os.path.join(pruned_data_dir, "bitcoin.conf")
        if not os.path.exists(bitcoin_conf_path):
            self.create_bitcoin_conf(bitcoin_conf_path)

        if os.path.exists(bitcoin_path):
            self.run_software(bitcoin_path, f'--datadir={pruned_data_dir}')
        else:
            self.update_output("Bitcoin software not found. Please install first.")

    def create_bitcoin_conf(self, conf_path):
        conf_content = """
        prune=550
        daemon=1
        """
        with open(conf_path, 'w') as conf_file:
            conf_file.write(conf_content)
        self.update_output("Created pruned bitcoin.conf file.")

    def run_bitcoin_miner(self):
        disclaimer_text = ("Disclaimer: Running the Bitcoin CPU miner in Melanin Click for an extended period of time on your machine may result "
                           "in increased wear and tear, overheating, and decreased performance of your hardware.")
        agreement = messagebox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
        machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        while not bitcoin_address or not machine_name:
            messagebox.showwarning("Warning", "Please provide valid Bitcoin address and machine name.")
            bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
            machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        cpuminer_path = os.path.expanduser('~/whive-core/whive/miner/minerd.exe')
        
        if not os.path.exists(cpuminer_path):
            self.update_output("Whive miner not found. Please ensure Whive Core is installed.")

        cmd = f'{cpuminer_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {bitcoin_address}.{machine_name} -t 2'

        # Open the miner in a new terminal window
        subprocess.Popen(['start', 'cmd', '/c', cmd], shell=True)
        self.update_output("Opened a new terminal for Bitcoin mining.")

    def run_whive_miner(self):
        disclaimer_text = ("Disclaimer: Running the Whive CPU miner in Melanin Click for an extended period of time on your machine may result "
                           "in increased wear and tear, overheating, and decreased performance of your hardware.")
        agreement = messagebox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        while not whive_address:
            messagebox.showwarning("Warning", "Please provide a valid Whive address.")
            whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        minerd_path = os.path.expanduser('~/whive-core/whive/miner/minerd.exe')
        
        if not os.path.exists(minerd_path):
            self.update_output("Whive miner not found. Please ensure Whive Core is installed.")

        cmd = f'{minerd_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {whive_address}.w1 -t 2'

        # Open the miner in a new terminal window
        subprocess.Popen(['start', 'cmd', '/c', cmd], shell=True)
        self.update_output("Opened a new terminal for Whive mining.")

    def run_software(self, software_path, *args):
        self.update_output(f"Running {software_path}...")
        subprocess.Popen([software_path, *args])

    def display_help(self):
        self.update_output("This is the help section. You can add instructions here or open a help file.")

    def update_output(self, message):
        self.output.config(state='normal')
        self.output.insert('end', message + "\n")
        self.output.config(state='disabled')
        self.output.see('end')


app = Application()
app.mainloop()
