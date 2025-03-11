import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import os
import urllib.request
import tarfile
import threading
from queue import Queue
import subprocess
import logging
import platform
import json
import re

# Set up logging
logging.basicConfig(filename="melanin_click.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)
        self.title("Melanin Click - Bitcoin & Whive Manager")
        
        # Set default size to 400x500 with minimum size
        self.minsize(400, 500)
        self.geometry("400x500")
        self.protocol("WM_DELETE_WINDOW", self.exit_app)

        # Main container with scrollbar
        self.canvas = tk.Canvas(self)
        self.scrollbar = ttk.Scrollbar(self, orient="vertical", command=self.canvas.yview)
        self.container = ttk.Frame(self.canvas)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.scrollbar.pack(side="right", fill="y")
        self.canvas.pack(side="left", fill="both", expand=True)
        
        self.canvas_window = self.canvas.create_window((0, 0), window=self.container, anchor="nw")
        self.container.bind("<Configure>", self.update_scrollregion_and_width)

        self.frames = {}
        for F in (StartPage, TermsPage, InstallPage):
            frame = F(self.container, self)
            self.frames[F] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame(StartPage)
        self.check_os_compatibility()

        # Make container responsive
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

    def update_scrollregion_and_width(self, event):
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        self.canvas.itemconfig(self.canvas_window, width=self.container.winfo_reqwidth())

    def show_frame(self, page):
        frame = self.frames[page]
        frame.tkraise()
        self.container.update_idletasks()
        self.canvas.itemconfig(self.canvas_window, width=self.container.winfo_reqwidth())
        if self.winfo_width() > self.container.winfo_reqwidth():
            self.canvas.itemconfig(self.canvas_window, width=self.winfo_width() - self.scrollbar.winfo_width())

    def check_os_compatibility(self):
        if platform.system() != "Linux":
            messagebox.showerror("OS Error", "This app is designed for Linux only.")
            self.exit_app()

    def exit_app(self):
        if messagebox.askokcancel("Exit", "Are you sure you want to exit?"):
            self.quit()
            logging.info("Application shutdown initiated by user.")

class StartPage(ttk.Frame):
    def __init__(self, parent, controller):
        ttk.Frame.__init__(self, parent)
        self.controller = controller

        # Create a main frame with a subtle border
        main_frame = ttk.Frame(self, style="Card.TFrame")
        main_frame.place(relx=0.5, rely=0.1, anchor="n")  # Align to top while keeping horizontal center

        # Placeholder for a logo/icon
        logo_label = ttk.Label(main_frame, text="🖱️", font=("Helvetica", 50), background="#3a3a3a", foreground="white")
        logo_label.pack(pady=(20, 10))

        # Title and subtitle
        ttk.Label(main_frame, text="Melanin Click", font=("Helvetica", 24, "bold"), background="#3a3a3a", foreground="white").pack(pady=(0, 5))
        ttk.Label(main_frame, text="Bitcoin & Whive Wallet and Miner Manager", font=("Helvetica", 12), background="#3a3a3a", foreground="#cccccc").pack(pady=(0, 20))

        # Buttons
        ttk.Button(main_frame, text="Get Started", command=lambda: controller.show_frame(TermsPage), style="Accent.TButton").pack(fill="x", padx=20, pady=5)
        ttk.Button(main_frame, text="Exit", command=controller.exit_app, style="Secondary.TButton").pack(fill="x", padx=20, pady=5)

class TermsPage(ttk.Frame):
    def __init__(self, parent, controller):
        ttk.Frame.__init__(self, parent)
        self.controller = controller

        # Title
        ttk.Label(self, text="Terms and Conditions", font=("Helvetica", 14, "bold")).pack(pady=5)

        # Text area with scrollbar
        text_frame = ttk.Frame(self)
        text_frame.pack(fill="both", expand=True, padx=5, pady=5)
        self.text = tk.Text(text_frame, height=10, wrap="word")
        scrollbar = ttk.Scrollbar(text_frame, orient="vertical", command=self.text.yview)
        self.text.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side="right", fill="y")
        self.text.pack(side="left", fill="both", expand=True)

        # Acceptance checkbox
        self.terms_accepted = tk.BooleanVar()
        ttk.Checkbutton(self, text="I accept the Terms and Conditions", variable=self.terms_accepted, command=self.toggle_next_button).pack(pady=2)

        # Button frame
        button_frame = ttk.Frame(self)
        button_frame.pack(pady=5, fill="x")
        self.next_button = ttk.Button(button_frame, text="Next", state='disabled', command=lambda: controller.show_frame(InstallPage), style="Accent.TButton")
        self.next_button.pack(side="left", padx=2, fill="x", expand=True)
        ttk.Button(button_frame, text="Exit", command=controller.exit_app).pack(side="left", padx=2, fill="x", expand=True)

        self.load_terms()

    def toggle_next_button(self):
        self.next_button.config(state='normal' if self.terms_accepted.get() else 'disabled')

    def load_terms(self):
        url = "https://raw.githubusercontent.com/melaninsolar/melaninclick/main/melanin_click_terms_of_use.md"
        try:
            with urllib.request.urlopen(url) as response:
                self.text.insert('end', response.read().decode())
            logging.info("Terms loaded successfully.")
        except urllib.error.URLError as e:
            self.text.insert('end', f"Failed to load terms: {e}")
            logging.error(f"Failed to load terms: {e}")
        self.text.config(state='disabled')

class InstallPage(ttk.Frame):
    def __init__(self, parent, controller):
        ttk.Frame.__init__(self, parent)
        self.controller = controller
        self.cancel_flag = False
        self.message_queue = Queue()
        self.after(100, self.process_queue)

        # Main content grid
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        # Output Area
        output_frame = ttk.LabelFrame(self, text="Output", padding=5)
        output_frame.grid(row=0, column=0, sticky="nsew", pady=5, padx=5)
        self.output = tk.Text(output_frame, state='disabled', height=5, wrap="word")
        self.output.tag_configure("error", foreground="red")
        self.output.tag_configure("success", foreground="green")
        self.output.pack(fill="both", expand=True)

        # Content Frame
        content_frame = ttk.Frame(self)
        content_frame.grid(row=1, column=0, sticky="nsew", pady=5, padx=5)
        content_frame.columnconfigure(0, weight=1)

        # Bitcoin Section
        bitcoin_frame = ttk.LabelFrame(content_frame, text="Bitcoin Core Wallet & Miner", padding=5)
        bitcoin_frame.pack(fill="x", pady=2)
        self._create_bitcoin_section(bitcoin_frame)

        # Whive Section
        whive_frame = ttk.LabelFrame(content_frame, text="Whive Core Wallet & Miner", padding=5)
        whive_frame.pack(fill="x", pady=2)
        self._create_whive_section(whive_frame)

        # Progress and Controls
        control_frame = ttk.Frame(self)
        control_frame.grid(row=2, column=0, sticky="ew", pady=5, padx=5)
        control_frame.columnconfigure(0, weight=1)
        self.progress = ttk.Progressbar(control_frame, mode='indeterminate')
        self.progress.grid(row=0, column=0, sticky="ew", pady=2)
        self._create_control_buttons(control_frame)

        # Load saved config
        self.load_config()

    def _create_bitcoin_section(self, parent):
        parent.columnconfigure(0, weight=1)
        ttk.Button(parent, text="Install Bitcoin Core", command=self.check_storage_and_install_bitcoin).grid(row=0, column=0, pady=1, sticky="ew")
        self.run_mainnet_button = ttk.Button(parent, text="Run Full Node", state='disabled', command=self.run_mainnet)
        self.run_mainnet_button.grid(row=1, column=0, pady=1, sticky="ew")
        self.run_pruned_node_button = ttk.Button(parent, text="Run Pruned Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=2, column=0, pady=1, sticky="ew")
        self.run_miner_button = ttk.Button(parent, text="Run Pool Miner", state='disabled', command=self.run_bitcoin_miner)
        self.run_miner_button.grid(row=5, column=0, pady=1, sticky="ew")

        # Mining Device Selection
        ttk.Label(parent, text="Mining Device:").grid(row=3, column=0, pady=1, sticky="w")
        self.miner_type = tk.StringVar(value="CPU Mining")
        ttk.OptionMenu(parent, self.miner_type, "CPU Mining", "CPU Mining", "StickMiner").grid(row=4, column=0, pady=1, sticky="ew")

        # Bitcoin Mining Pool Selection
        ttk.Label(parent, text="Bitcoin Mining Pool:").grid(row=6, column=0, pady=1, sticky="w")
        self.bitcoin_pool = tk.StringVar(value="Public Pool")
        self.bitcoin_pool_options = {
            "CKPool": "stratum+tcp://solo.ckpool.org:3333",
            "Public Pool": "stratum+tcp://public-pool.io:21496",
            "Ocean Pool": "stratum+tcp://stratum.ocean.xyz:3000",
            "Ocean Pool (Alt)": "stratum+tcp://mine.ocean.xyz:3334",
            "Kano Pool": "stratum+tcp://stratum.kano.is:3333"  # Added for StickMiner
        }
        ttk.OptionMenu(parent, self.bitcoin_pool, "Public Pool", *self.bitcoin_pool_options.keys()).grid(row=7, column=0, pady=1, sticky="ew")

    def _create_whive_section(self, parent):
        parent.columnconfigure(0, weight=1)
        ttk.Button(parent, text="Install Whive Core", command=self.check_storage_and_install_whive).grid(row=0, column=0, pady=1, sticky="ew")
        self.run_whive_button = ttk.Button(parent, text="Run Full Node", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=1, column=0, pady=1, sticky="ew")
        self.run_whive_miner_button = ttk.Button(parent, text="Run Pool Miner", state='disabled', command=self.run_whive_miner)
        self.run_whive_miner_button.grid(row=2, column=0, pady=1, sticky="ew")

    def _create_control_buttons(self, parent):
        parent.columnconfigure((0, 1, 2), weight=1)
        self.cancel_button = ttk.Button(parent, text="Cancel", command=self.cancel_install, state='disabled')
        self.cancel_button.grid(row=1, column=0, padx=2, pady=2, sticky="ew")
        ttk.Button(parent, text="Help", command=self.display_help).grid(row=1, column=1, padx=2, pady=2, sticky="ew")
        ttk.Button(parent, text="Exit", command=self.controller.exit_app, style="Accent.TButton").grid(row=1, column=2, padx=2, pady=2, sticky="ew")

    def load_config(self):
        try:
            with open("config.json", "r") as f:
                config = json.load(f)
                self.miner_type.set(config.get("miner_type", "CPU Mining"))
                self.bitcoin_pool.set(config.get("bitcoin_pool", "Public Pool"))
            logging.info("Configuration loaded.")
        except FileNotFoundError:
            pass

    def save_config(self):
        config = {
            "miner_type": self.miner_type.get(),
            "bitcoin_pool": self.bitcoin_pool.get()
        }
        with open("config.json", "w") as f:
            json.dump(config, f)
        logging.info("Configuration saved.")

    def check_storage_and_install_bitcoin(self):
        self.cancel_flag = False
        self.progress.start()
        self.cancel_button.config(state='normal')
        bitcoin_install_path = os.path.expanduser('~/bitcoin-core')
        if os.path.exists(bitcoin_install_path):
            if not messagebox.askyesno("Update", "Bitcoin Core is installed. Update it?"):
                self.update_output("Skipping Bitcoin Core update.", "success")
                self.enable_bitcoin_buttons()
                self.progress.stop()
                return

        self.update_output("Checking storage for Bitcoin...")
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)

        if free_space > 600:
            threading.Thread(
                target=self.install,
                args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz", False)
            ).start()
        elif free_space > 10:
            threading.Thread(
                target=self.install,
                args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz", True)
            ).start()
        else:
            self.update_output(f"Insufficient space: {free_space:.2f} GB available.", "error")
            self.progress.stop()

    def check_storage_and_install_whive(self):
        self.cancel_flag = False
        self.progress.start()
        self.cancel_button.config(state='normal')
        whive_install_path = os.path.expanduser('~/whive-core')
        if os.path.exists(whive_install_path):
            if not messagebox.askyesno("Update", "Whive Core is installed. Update it?"):
                self.update_output("Skipping Whive Core update.", "success")
                self.enable_whive_buttons()
                self.progress.stop()
                return

        self.update_output("Checking storage for Whive...")
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)

        if free_space > 10:
            threading.Thread(
                target=self.install,
                args=('whive', "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-x86_64-linux-gnu.tar.gz", False)
            ).start()
        else:
            self.update_output(f"Insufficient space: {free_space:.2f} GB available.", "error")
            self.progress.stop()

    def install(self, software, download_url, prune=False):
        self.update_output(f"Downloading {software}...")
        install_path = os.path.expanduser(f'~/{software}-core')
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")
        os.makedirs(install_path, exist_ok=True)

        try:
            urllib.request.urlretrieve(download_url, downloaded_file)
            if self.cancel_flag:
                os.remove(downloaded_file)
                self.message_queue.put(("Installation cancelled.", "error"))
                return
            self.message_queue.put((f"Extracting {software}...", None))
            with tarfile.open(downloaded_file, "r:gz") as tar:
                tar.extractall(path=install_path)
            os.remove(downloaded_file)
            self.message_queue.put((f"{software.capitalize()} installed successfully!", "success"))
            logging.info(f"{software} installed at {install_path}")

            if software == 'bitcoin':
                self.enable_bitcoin_buttons()
                mainnet_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/mainnet")
                pruned_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")
                os.makedirs(mainnet_dir, exist_ok=True)
                os.makedirs(pruned_dir, exist_ok=True)
                if not os.path.exists(os.path.join(mainnet_dir, "bitcoin.conf")):
                    self.create_bitcoin_conf(os.path.join(mainnet_dir, "bitcoin.conf"), prune=False)
                if not os.path.exists(os.path.join(pruned_dir, "bitcoin.conf")):
                    self.create_bitcoin_conf(os.path.join(pruned_dir, "bitcoin.conf"), prune=True)
            elif software == 'whive':
                self.enable_whive_buttons()

        except Exception as e:
            self.message_queue.put((f"Error installing {software}: {e}", "error"))
            logging.error(f"Error installing {software}: {e}")
        finally:
            self.after(0, lambda: self.progress.stop())
            self.after(0, lambda: self.cancel_button.config(state='disabled'))

    def enable_bitcoin_buttons(self):
        self.run_mainnet_button.config(state='normal')
        self.run_pruned_node_button.config(state='normal')
        self.run_miner_button.config(state='normal')

    def enable_whive_buttons(self):
        self.run_whive_button.config(state='normal')
        self.run_whive_miner_button.config(state='normal')

    def create_bitcoin_conf(self, conf_path, prune=False):
        conf_content = "prune=550\ndaemon=1\ntxindex=1\n" if prune else "daemon=1\ntxindex=1\n"
        with open(conf_path, 'w') as conf_file:
            conf_file.write(conf_content)
        self.update_output(f"Created bitcoin.conf at {conf_path}")

    def run_mainnet(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        mainnet_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/mainnet")
        conf_path = os.path.join(mainnet_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            os.makedirs(mainnet_conf_dir, exist_ok=True)
            self.create_bitcoin_conf(conf_path, prune=False)
        self.run_software(bitcoin_path, f"-conf={conf_path}")

    def run_pruned_node(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        pruned_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")
        conf_path = os.path.join(pruned_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            os.makedirs(pruned_conf_dir, exist_ok=True)
            self.create_bitcoin_conf(conf_path, prune=True)
        self.run_software(bitcoin_path, f"--datadir={pruned_conf_dir}", f"-conf={conf_path}")

    def build_cgminer(self):
        self.update_output("Building CGMiner for StickMiner...")
        commands = [
            "sudo apt-get update",
            "sudo apt-get upgrade -y",
            "sudo apt-get install -y build-essential autoconf automake libtool pkg-config libcurl4-openssl-dev libudev-dev libusb-1.0-0-dev libncurses5-dev zlib1g-dev git",
            "cd ~",
            "git clone https://github.com/kanoi/cgminer.git",
            "cd ~/cgminer",
            "CFLAGS=\"-O2 -march=native -fcommon\" ./autogen.sh --enable-gekko --enable-icarus",
            "make",
            "sudo apt-get install -y openjdk-8-jre-headless"
        ]
        for cmd in commands:
            try:
                subprocess.check_call(cmd, shell=True)
                self.update_output(f"Executed: {cmd}", "success")
            except subprocess.CalledProcessError as e:
                self.update_output(f"Error executing {cmd}: {e}", "error")
                return False
        self.update_output("CGMiner built successfully!", "success")
        return True

    def run_bitcoin_miner(self):
        if not messagebox.askyesno("Disclaimer", "Mining may cause hardware wear. Proceed?"):
            return

        bitcoin_address = simpledialog.askstring("Input", "Enter Bitcoin address:", parent=self)
        if not bitcoin_address or not self.validate_btc_address(bitcoin_address):
            self.update_output("Invalid or no Bitcoin address provided. Please use a valid BTC address (e.g., bc1q... or 1...)", "error")
            return
        machine_name = simpledialog.askstring("Input", "Enter machine name (worker ID):", parent=self)
        if not machine_name:
            self.update_output("No machine name provided.", "error")
            return

        miner_type = self.miner_type.get()
        pool_url = self.bitcoin_pool_options[self.bitcoin_pool.get()]
        cgminer_path = os.path.expanduser('~/cgminer/cgminer')

        if miner_type == "StickMiner":
            if not os.path.exists(cgminer_path):
                if not self.build_cgminer():
                    self.update_output("Failed to build CGMiner. Please check the output and try again.", "error")
                    return
            cmd = f"{cgminer_path} -o {pool_url} -u {bitcoin_address} -p x --suggest-diff 442"
            try:
                subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f"sudo {cmd}; exec bash"])
                self.update_output(f"Started StickMiner with CGMiner in a new terminal window (using {self.bitcoin_pool.get()} pool)...", "success")
                logging.info(f"Started StickMiner with command: {cmd}")
            except subprocess.CalledProcessError as e:
                self.update_output(f"Error starting StickMiner: {e}. Try running with sudo manually: sudo {cmd}", "error")
                logging.error(f"Failed to start StickMiner: {e}")
        else:  # CPU Mining
            minerd_path = os.path.expanduser('~/cpuminer-opt-linux/cpuminer')
            if not os.path.exists(minerd_path):
                self.update_output("CPU miner not found. Downloading and extracting...")
                download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-linux-5.0.40.tar.gz"
                self.download_and_extract_miner(download_url)
            cmd = f'{minerd_path} -a sha256d -o {pool_url} -u {bitcoin_address}.{machine_name} -p x'
            self.run_terminal_command(cmd, "Bitcoin")

    def run_whive_miner(self):
        if not messagebox.askyesno("Disclaimer", "Mining may cause hardware wear. Proceed?"):
            return

        whive_address = simpledialog.askstring("Input", "Enter Whive address:", parent=self)
        if not whive_address:
            self.update_output("No Whive address provided.", "error")
            return

        minerd_path = os.path.expanduser('~/cpuminer-opt-linux/cpuminer')
        if not os.path.exists(minerd_path):
            self.update_output("Whive miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-linux-5.0.40.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = f'{minerd_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {whive_address}.w1 -t 2'
        self.run_terminal_command(cmd, "Whive")

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

    def run_software(self, software_path, *args):
        try:
            subprocess.Popen([software_path, *args])
            self.update_output(f"Started {os.path.basename(software_path)}...", "success")
            logging.info(f"Started {software_path}")
        except Exception as e:
            self.update_output(f"Failed to start {software_path}: {e}", "error")
            logging.error(f"Failed to start {software_path}: {e}")

    def run_terminal_command(self, cmd, software):
        try:
            subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f"{cmd}; exec bash"])
            self.update_output(f"Started {software} mining in a new terminal window...", "success")
            logging.info(f"Started {software} miner with command: {cmd}")
        except Exception as e:
            self.update_output(f"Failed to start {software} miner: {e}", "error")
            logging.error(f"Failed to start {software} miner: {e}")

    def validate_btc_address(self, address):
        pattern = r"^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-HJ-NP-Z0-9]{38,58}$"
        is_valid = bool(re.match(pattern, address))
        if not is_valid:
            logging.warning(f"Invalid Bitcoin address entered: {address}")
        return is_valid

    def display_help(self):
        help_text = (
            "Melanin Click Help:\n"
            "- Install: Download and set up Bitcoin or Whive Core.\n"
            "- Run Full Node: Start a full Bitcoin node (requires ~600GB).\n"
            "- Run Pruned Node: Start a pruned Bitcoin node (~10GB).\n"
            "- Run Miner: Connect to a selected pool (CKPool, Public Pool, Ocean Pool, Ocean Pool Alt, Kano Pool).\n"
            "- Mining Device: Choose between CPU Mining or StickMiner (requires build process).\n"
            "- Bitcoin Address: Use a valid BTC address (e.g., 1..., 3..., bc1...).\n"
            "Contact support at support@melaninclick.com for assistance."
        )
        self.update_output(help_text)

    def update_output(self, message, tag=None):
        self.output.config(state='normal')
        self.output.insert('end', message + "\n", tag)
        self.output.config(state='disabled')
        self.output.see('end')

    def process_queue(self):
        while not self.message_queue.empty():
            msg, tag = self.message_queue.get() if isinstance(self.message_queue.get(), tuple) else (self.message_queue.get(), None)
            self.update_output(msg, tag)
        self.after(100, self.process_queue)

    def cancel_install(self):
        self.cancel_flag = True
        self.update_output("Cancelling installation...", "error")

    def destroy(self):
        self.save_config()
        super().destroy()

if __name__ == "__main__":
    app = Application()
    style = ttk.Style()
    style.configure("Accent.TButton", font=("Helvetica", 10, "bold"), foreground="white", background="#0078d7")
    style.map("Accent.TButton", background=[("active", "#005bb5")])
    style.configure("Secondary.TButton", font=("Helvetica", 10), foreground="white", background="#555555")
    style.map("Secondary.TButton", background=[("active", "#444444")])
    style.configure("TLabelFrame", background="#2e2e2e", foreground="white", font=("Helvetica", 12, "bold"))
    style.configure("TLabel", background="#2e2e2e", foreground="white")
    style.configure("TButton", background="#444444", foreground="white")
    style.configure("Card.TFrame", background="#3a3a3a", relief="raised", borderwidth=2)
    app.configure(bg="#2e2e2e")
    app.mainloop()