from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / 'Entrega_E2E_Cafeteria.pdf'
screens = [
    ('Recorrido 1 - camino exitoso', ROOT / 'cypress/screenshots/01-camino-exitoso.cy.ts/camino-exitoso-confirmado.png', 'Se comprueba el identificador ORD-... y el total persistido de $7.25.'),
    ('Recorrido 2 - validacion', ROOT / 'cypress/screenshots/02-validacion.cy.ts/validacion-pedido-vacio.png', 'El pedido vacio mantiene el total en $0.00 y el boton de confirmacion deshabilitado.'),
    ('Recorrido 3 - fallo controlado', ROOT / 'cypress/screenshots/03-fallo-controlado.cy.ts/fallo-controlado-recuperado.png', 'Se simula un 503, se conserva el carrito y el segundo intento confirma la orden.'),
]

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCafe', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=30, textColor=colors.HexColor('#27332d'), alignment=TA_CENTER, spaceAfter=14))
styles.add(ParagraphStyle(name='Sub', parent=styles['Normal'], fontSize=11, leading=16, textColor=colors.HexColor('#718078'), alignment=TA_CENTER, spaceAfter=22))
styles.add(ParagraphStyle(name='H', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#315c4d'), spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name='BodyCafe', parent=styles['BodyText'], fontSize=10.5, leading=15, textColor=colors.HexColor('#27332d'), spaceAfter=8))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontSize=9, leading=12, textColor=colors.HexColor('#718078')))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#718078'))
    canvas.drawString(0.65 * inch, 0.4 * inch, 'Brújula Cafe - evidencia de evaluacion E2E')
    canvas.drawRightString(7.85 * inch, 0.4 * inch, f'Pagina {doc.page}')
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=.65*inch, leftMargin=.65*inch, topMargin=.55*inch, bottomMargin=.65*inch)
story = [Spacer(1, .35*inch), Paragraph('Brújula Cafe', styles['TitleCafe']), Paragraph('Reto: construir y probar una aplicacion web de extremo a extremo', styles['Sub'])]
table = Table([
    ['Repositorio publico', 'https://github.com/ZaqueoChivalan/-S10-Aplicaci-n-web-con-pruebas-E2E-en-Cypress'],
    ['GitHub Actions exitoso', 'https://github.com/ZaqueoChivalan/-S10-Aplicaci-n-web-con-pruebas-E2E-en-Cypress/actions/runs/36288228552'],
    ['Video - maximo 3 minutos', '[COMPLETAR] enlace publico al video'],
    ['Resultado local', '3 specs, 3 passing, 0 failing'],
], colWidths=[1.7*inch, 5.8*inch])
table.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#dce9df')),('TEXTCOLOR',(0,0),(0,-1),colors.HexColor('#315c4d')),('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),('FONTNAME',(1,0),(1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),9),('LEADING',(0,0),(-1,-1),12),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#e5e0d6')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
story += [table, Spacer(1, 18), Paragraph('Resumen de implementacion', styles['H']), Paragraph('Sistema de pedidos para cafeteria con frontend estatico, API REST local en Node.js y persistencia en archivos JSON. La API ofrece productos, creacion de ordenes y reinicio de datos de prueba. La suite Cypress usa TypeScript, baseUrl, selectores accesibles y data-cy estable.', styles['BodyCafe']), Paragraph('La preparacion de datos ocurre con cy.request(POST /api/test/reset) antes de cada prueba. No se usan esperas numericas. La prueba de fallo intercepta una sola solicitud 503 y luego deja que el reintento llegue a la API real.', styles['BodyCafe']), PageBreak()]
for title, image_path, caption in screens:
    story.append(Paragraph(title, styles['H']))
    if image_path.exists():
        story.append(Image(str(image_path), width=7.15*inch, height=5.6*inch, kind='proportional'))
    else:
        story.append(Paragraph('Captura no encontrada en la ejecucion local.', styles['BodyCafe']))
    story += [Spacer(1, 5), Paragraph(caption, styles['Small']), Spacer(1, 12)]
    story.append(PageBreak())
story += [Paragraph('Evidencia tecnica y guion del video', styles['H']), Paragraph('Camino exitoso: seleccionar Espresso y Croissant, aumentar Espresso a cantidad 2, confirmar y mostrar el identificador y total. En cypress/e2e/01-camino-exitoso.cy.ts, cy.intercept() usa el alias @createOrder para validar el cuerpo de la solicitud y la respuesta 201, y despues se verifica GET /api/orders.', styles['BodyCafe']), Paragraph('Validacion: al iniciar el pedido esta vacio, el boton Confirmar pedido esta disabled y el intercept no recibe solicitudes POST. Fallo controlado: se simula un 503 con times: 1, se muestra el mensaje, se conserva el carrito y el siguiente click se recupera contra la API real.', styles['BodyCafe']), Paragraph('Guion sugerido del video (maximo 3 minutos): 0:00 mostrar el menu; 0:30 ejecutar el camino exitoso; 1:20 explicar brevemente el alias de cy.intercept(); 1:50 mostrar el resumen verde de Cypress; 2:20 abrir la ejecucion exitosa de GitHub Actions.', styles['BodyCafe']), Paragraph('Accion pendiente del estudiante: reemplazar el campo [COMPLETAR] del video por un enlace publico despues de publicar la grabacion.', styles['BodyCafe'])]
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
