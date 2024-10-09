

# **Melanin Click Developer Script Setup Guide**

## **Prerequisites**

- **Python 3:** Ensure you have Python 3 installed on your system. If not, you can download and install it from the official [Python website](https://www.python.org/downloads/).

## **Setup Instructions**

1. ### Clone/Download the Repository

   - If your code is in a GitHub repository, clone it using:
     ```bash
     git clone https://github.com/melaninsolar/melaninclick
     ```
   - Alternatively, download the Python script and place it in a suitable directory.

2. ### Navigate to the Script Directory

   Open a terminal or command prompt:
   ```bash
   cd /path/to/melaninclick
   ```

3. ### Set Up a Virtual Environment (Recommended)

   Create and activate a virtual environment:
   ```bash
   python3 -m venv env
   source env/bin/activate  # On Windows, use: env\Scripts\activate
   ```

4. ### Install Dependencies

   Install the necessary Python packages:
   ```bash
   pip install tkinter Pillow
   ```

   > **Note:** `tkinter` is usually part of the Python standard library. However, if there are any issues, installing it explicitly might resolve them.

5. ### Run the Script

   Execute the Python script:
   ```bash
   python3 script_name.py
   ```

## **Troubleshooting**

- **`tkinter` Installation:** If you face issues with `tkinter`, ensure `tk-dev` is installed on Linux. For macOS, the default Python installation typically includes `tkinter`.

- **Pillow Version:** Ensure the latest version of `Pillow` is installed. If there are issues, try:
  ```bash
  pip install Pillow==8.0
  ```

- **Script Permissions:** If the script doesn't execute, check its permissions. Make it executable with:
  ```bash
  chmod +x script_name.py
  ```

---
