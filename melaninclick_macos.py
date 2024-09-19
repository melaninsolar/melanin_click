import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess
import tkinter.messagebox as msgbox
from tkinter import simpledialog, messagebox

class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)
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

        tk.Label(frame, text="BITCOIN CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=0, column=0, pady=10)

        self.install_bitcoin_button = tk.Button(frame, text="STEP 1: Install Bitcoin Core Wallet", command=self.check_storage_and_install_bitcoin)
        self.install_bitcoin_button.grid(row=1, column=0, padx=10, pady=5, sticky="w")

        self.run_mainnet_button = tk.Button(frame, text="STEP 2: Run Bitcoin Wallet & Full Node", state='disabled', command=self.run_mainnet)
        self.run_mainnet_button.grid(row=2, column=0, padx=10, pady=5, sticky="w")

        self.public_pool_button = tk.Button(frame, text="STEP 3: Run Bitcoin Pool Miner (SV1)", state='disabled', command=self.run_bitcoin_miner)
        self.public_pool_button.grid(row=3, column=0, padx=10, pady=5, sticky="w")

        self.run_pruned_node_button = tk.Button(frame, text="STEP 4: Run Pruned Bitcoin Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=4, column=0, padx=10, pady=5, sticky="w")

        separator1 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator1.grid(row=5, columnspan=1, pady=10, sticky='ew')

        tk.Label(frame, text="WHIVE CORE WALLET & MINER", font=("Helvetica", 14, "bold")).grid(row=6, column=0, pady=10)

        self.install_whive_button = tk.Button(frame, text="STEP 1: Install Whive Core Wallet", command=self.install_whive)
        self.install_whive_button.grid(row=7, column=0, padx=10, pady=5, sticky="w")

        self.run_whive_button = tk.Button(frame, text="STEP 2: Run Whive Wallet & Full Node", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=8, column=0, padx=10, pady=5, sticky="w")

        self.run_cpuminer_button = tk.Button(frame, text="STEP 3: Run Whive Pool Miner (SV1)", state='disabled', command=self.run_whive_miner)
        self.run_cpuminer_button.grid(row=9, column=0, padx=10, pady=5, sticky="w")

        separator2 = tk.Frame(frame, height=2, bg="grey", width=frame.winfo_width())
        separator2.grid(row=10, columnspan=1, pady=10, sticky='ew')

        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=11, column=0, padx=10, pady=5, sticky="w")

        self.quit_button = tk.Button(frame, text="Quit", command=controller.quit)
        self.quit_button.grid(row=12, column=0, padx=10, pady=5, sticky="w")

    def check_storage_and_install_bitcoin(self):
        self.update_output("Checking storage space for Bitcoin installation...")
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)  # free space in GB

        if free_space > 600:
            threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")).start()
        elif free_space > 10:
            self.install_pruned_bitcoin()
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")
            return

        # Disable the buttons during installation
        self.install_bitcoin_button.config(state='disabled')

    def install_pruned_bitcoin(self):
        self.update_output("Installing pruned Bitcoin node... This will take 1-2 minutes.")
        pruned_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")
        os.makedirs(pruned_dir, exist_ok=True)
        conf_path = os.path.join(pruned_dir, "bitcoin.conf")
        self.create_bitcoin_conf(conf_path, prune=True)
        threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")).start()

    def install(self, software, download_url):
        self.update_output(f"Downloading {software}... Please wait.")
        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")
        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Created installation directory at {install_path}")

        try:
            urllib.request.urlretrieve(download_url, downloaded_file)
            self.schedule_update_output(f"Extracting {software} tarball...")

            with tarfile.open(downloaded_file, "r:gz") as tar:
                tar.extractall(path=install_path)

            os.remove(downloaded_file)
            self.schedule_update_output(f"{software.capitalize()} installation complete!")

            if software == 'bitcoin':
                self.update_output("BITCOIN CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL BITCOIN NODE (STEP 2)\n - RUN BITCOIN POOL MINER (STEP 3)")
                self.run_mainnet_button.config(state='normal')
                self.public_pool_button.config(state='normal')
                self.run_pruned_node_button.config(state='normal')

            elif software == 'whive':
                self.update_output("WHIVE CORE WALLET INSTALLED SUCCESSFULLY.\nYou can now:\n - RUN FULL WHIVE NODE (STEP 2)\n - RUN WHIVE POOL MINER (STEP 3)")
                self.run_whive_button.config(state='normal')
                self.run_cpuminer_button.config(state='normal')

        except Exception as e:
            self.update_output(f"Error downloading or extracting {software}: {e}")

        # Re-enable the install buttons after completion
        if software == 'bitcoin':
            self.install_bitcoin_button.config(state='normal')
        elif software == 'whive':
            self.install_whive_button.config(state='normal')

    def run_mainnet(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        mainnet_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/mainnet")

        if not os.path.exists(bitcoin_path):
            bitcoin_path = "/Applications/Bitcoin-qt.app/Contents/MacOS/Bitcoin-qt"

        if not os.path.exists(bitcoin_path):
            self.update_output("Error: Could not find a valid Bitcoin installation.")
            return

        os.makedirs(mainnet_conf_dir, exist_ok=True)
        conf_path = os.path.join(mainnet_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            self.create_bitcoin_conf(conf_path, prune=False)

        self.update_output("Starting Full Bitcoin Node...")
        self.run_software(bitcoin_path, f"-conf={conf_path}")

    def run_pruned_node(self):
        pruned_bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        pruned_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")

        if not os.path.exists(pruned_bitcoin_path):
            self.update_output("Error: Could not find the pruned Bitcoin node installation.")
            return

        conf_path = os.path.join(pruned_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            self.create_bitcoin_conf(conf_path, prune=True)

        self.update_output("Starting Pruned Bitcoin Node...")
        self.run_software(pruned_bitcoin_path, f"--datadir={pruned_conf_dir}", f"-conf={conf_path}")

    def create_bitcoin_conf(self, conf_path, prune=False):
        conf_content = "prune=550\ndaemon=1\n" if prune else "daemon=1\n"
        with open(conf_path, 'w') as conf_file:
            conf_file.write(conf_content)
        self.update_output(f"Created bitcoin.conf at {conf_path}")

    def run_bitcoin_miner(self):
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
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

        self.update_output(f"Bitcoin Address: {bitcoin_address}")
        self.update_output(f"Machine Name: {machine_name}")

        minerd_path = os.path.expanduser('~/whive-core/whive/miner/minerd')

        if not os.path.exists(minerd_path):
            self.update_output("Bitcoin miner not found. Please ensure Whive Core is installed.")

        cmd = f'{minerd_path} -a sha256d -o stratum+tcp://public-pool.io:21496 -u {bitcoin_address}.{machine_name} -p x'

        self.update_output("Starting Bitcoin mining process...")
        osascript_cmd = f'osascript -e \'tell application "Terminal" to do script "{cmd}"\''
        subprocess.Popen(osascript_cmd, shell=True)

    def run_whive_miner(self):
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
                           "in increased wear and tear, overheating, and decreased performance of your hardware.")
        agreement = msgbox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        while not whive_address:
            messagebox.showwarning("Warning", "Please provide a valid Whive address.")
            whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        self.update_output(f"Whive Address: {whive_address}")

        minerd_path = os.path.expanduser('~/whive-core/whive/miner/minerd')

        if not os.path.exists(minerd_path):
            self.update_output("Whive miner not found. Please ensure Whive Core is installed.")

        cmd = f'{minerd_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {whive_address}.w1 -t 2'

        self.update_output("Starting Whive mining process...")
        osascript_cmd = f'osascript -e \'tell application "Terminal" to do script "{cmd}"\''
        subprocess.Popen(osascript_cmd, shell=True)

    def schedule_update_output(self, message):
        self.after(0, self.update_output, message)

    def install_whive(self):
        self.update_output("Installing Whive Core... This will take 1-2 minutes.")
        threading.Thread(target=self.install, args=('whive', "https://github.com/whiveio/whive_releases/releases/download/22.2.3/whive-ventura-22.2.3-osx64.tar.gz")).start()

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.update_output("Starting Whive Core...")
        self.run_software(whive_path)

    def run_software(self, software_path, *args):
        self.update_output(f"Running software from {software_path}...")
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
