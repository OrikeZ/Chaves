from flask import Flask, request, jsonify
import win32print
import win32ui

app = Flask(__name__)

PRINTER_NAME = "RICOH SP 3710SF PCL 6"

def imprimir_ticket(texto):
    hPrinter = win32print.OpenPrinter(PRINTER_NAME)
    try:
        pdc = win32ui.CreateDC()
        pdc.CreatePrinterDC(PRINTER_NAME)
        pdc.StartDoc("Ticket de Chave")
        pdc.StartPage()
        pdc.TextOut(100, 100, texto)
        pdc.EndPage()
        pdc.EndDoc()
        pdc.DeleteDC()
    finally:
        win32print.ClosePrinter(hPrinter)

@app.route('/imprimir', methods=['POST'])
def imprimir():
    dados = request.json
    texto = f"""
    REGISTRO Nº: {dados.get('registro', '---')}
    PESSOA: {dados.get('pessoa', '---')}
    RETIRADA: {dados.get('retirada', '---')}
    """
    if 'devolucao' in dados:
        texto += f"DEVOLUÇÃO: {dados['devolucao']}\n"

    imprimir_ticket(texto.strip())
    return jsonify({"status": "sucesso", "mensagem": "Ticket impresso"})

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
