from flask import Flask, render_template, request, redirect, url_for, session, make_response
from models import db, Product, Reference, BOM, User
from functools import wraps
import pdfkit

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'
db.init_app(app)

# Decorator for user role access
def login_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_role' not in session or session['user_role'] != role:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/')
@login_required('admin')
def product_management():
    agrifood = Product.query.filter_by(name='Agrifood').first()
    perfumery = Product.query.filter_by(name='Perfumery').first()

    agrifood_refs = Reference.query.filter_by(product_id=agrifood.id).all()
    perfumery_refs = Reference.query.filter_by(product_id=perfumery.id).all()

    return render_template('index.html', agrifood_refs=agrifood_refs, perfumery_refs=perfumery_refs)

# Customer Needs Management
@app.route('/customer_needs', methods=['GET', 'POST'])
@login_required('user')
def customer_needs():
    if request.method == 'POST':
        needs = request.form['customer_needs']
        specifications = f"Specifications based on: {needs}"
        return render_template('specifications.html', specs=specifications)
    return render_template('customer_needs.html')

# BOM Management (Admin only)
@app.route('/manage_bom', methods=['GET', 'POST'])
@login_required('admin')
def manage_bom():
    if request.method == 'POST':
        product_id = request.form['product_id']
        component = request.form['component']
        process = request.form['process']
        bom = BOM(product_id=product_id, component=component, process=process)
        db.session.add(bom)
        db.session.commit()
        return redirect(url_for('product_management'))
    return render_template('manage_bom.html')

# Document Extraction (Invoices)
@app.route('/generate_invoice')
@login_required('admin')
def generate_invoice():
    html = render_template('invoice.html', product='Sample Product', price=100)
    pdf = pdfkit.from_string(html, False)
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=invoice.pdf'
    return response

# User Authentication
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session['user_role'] = user.role
            return redirect(url_for('product_management'))
        return "Invalid credentials"
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
