'use client'

import React, { useState } from 'react'
import { FaSearch, FaShoppingCart, FaUser, FaHeart, FaIndustry, FaPhone, FaEnvelope } from 'react-icons/fa'
import ChatWidget from './component/ChatWidget'


interface RawMaterial {
  id: string
  name: string
  category: string
  pricePerUnit: number
  unit: string
  minOrderQuantity: number
  availableStock: number
  image: string
  specifications?: string[]
  leadTime: string
}

const rawMaterials: RawMaterial[] = [
  {
    id: 'rm-001',
    name: 'Steel Rebar Grade 60',
    category: 'Steel & Metal',
    pricePerUnit: 0.85,
    unit: 'per lb',
    minOrderQuantity: 1000,
    availableStock: 50000,
    image: '/Img/steel1.jpg',
    specifications: ['ASTM A615', 'Grade 60', 'Ribbed Surface'],
    leadTime: '5-7 business days'
  },
  {
    id: 'rm-002',
    name: 'Portland Cement Type I',
    category: 'Concrete & Masonry',
    pricePerUnit: 12.50,
    unit: 'per 94lb bag',
    minOrderQuantity: 50,
    availableStock: 2000,
    image: '/Img/steel1.jpg',
    specifications: ['ASTM C150', 'Type I', '94lb bags'],
    leadTime: '3-5 business days'
  },
  {
    id: 'rm-003',
    name: 'Structural Steel Beam I-12',
    category: 'Steel & Metal',
    pricePerUnit: 4.20,
    unit: 'per linear foot',
    minOrderQuantity: 20,
    availableStock: 150,
    image: '/Img/steel1.jpg',
    specifications: ['ASTM A992', 'W12x26', 'Hot Rolled'],
    leadTime: '7-10 business days'
  },
  {
    id: 'rm-004',
    name: 'Crushed Gravel #57',
    category: 'Aggregates',
    pricePerUnit: 28.00,
    unit: 'per ton',
    minOrderQuantity: 5,
    availableStock: 500,
    image: '/Img/steel1.jpg',
    specifications: ['3/4" - 1" stones', 'Clean crushed stone'],
    leadTime: '2-3 business days'
  },
  {
    id: 'rm-005',
    name: 'Aluminum Sheet 6061-T6',
    category: 'Aluminum',
    pricePerUnit: 3.85,
    unit: 'per sq ft',
    minOrderQuantity: 100,
    availableStock: 800,
    image: '/Img/steel1.jpg',
    specifications: ['0.125" thickness', '4x8 sheets', 'Mill finish'],
    leadTime: '4-6 business days'
  },
  {
    id: 'rm-006',
    name: 'Ready-Mix Concrete 3000 PSI',
    category: 'Concrete & Masonry',
    pricePerUnit: 135.00,
    unit: 'per cubic yard',
    minOrderQuantity: 3,
    availableStock: 100,
    image: '/Img/steel1.jpg',
    specifications: ['3000 PSI strength', 'Standard mix', 'Delivered'],
    leadTime: 'Same day (with advance order)'
  }
]

// Raw Material Card Component
const RawMaterialCard: React.FC<{
  material: RawMaterial
  onRequestQuote: (material: RawMaterial) => void
}> = ({ material, onRequestQuote }) => (
  <div style={{
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px',
    width: '320px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <img 
      src={material.image} 
      alt={material.name}
      style={{
        width: '100%',
        height: '160px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '12px'
      }}
    />
    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#2c3e50' }}>
      {material.name}
    </h3>
    <p style={{ margin: '4px 0', color: '#7f8c8d', fontSize: '14px' }}>
      Category: {material.category}
    </p>
    <div style={{ margin: '8px 0' }}>
      <strong style={{ fontSize: '16px', color: '#27ae60' }}>
        ${material.pricePerUnit} {material.unit}
      </strong>
    </div>
    <div style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
      Min Order: {material.minOrderQuantity.toLocaleString()} units
    </div>
    <div style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
      In Stock: {material.availableStock.toLocaleString()} units
    </div>
    <div style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
      Lead Time: {material.leadTime}
    </div>
    {material.specifications && (
      <div style={{ margin: '8px 0' }}>
        <small style={{ color: '#666' }}>Specifications:</small>
        <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
          {material.specifications.map((spec, index) => (
            <li key={index}>{spec}</li>
          ))}
        </ul>
      </div>
    )}
    <button
      onClick={() => onRequestQuote(material)}
      style={{
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      Request Quote
    </button>
  </div>
)

const B2BRawMaterialsStore = () => {
  const [quoteItems, setQuoteItems] = useState<RawMaterial[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const handleRequestQuote = (material: RawMaterial) => {
    setQuoteItems((prev) => [...prev, material])
    alert(`Quote requested for ${material.name}`)
  }

  const categories = ['All', ...Array.from(new Set(rawMaterials.map(m => m.category)))]
  const filteredMaterials = selectedCategory === 'All' 
    ? rawMaterials 
    : rawMaterials.filter(m => m.category === selectedCategory)

  return (
    <>
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #34495e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaIndustry size={24} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>IndustrialSource</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaPhone size={14} />
                <span>1800-000-001</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaEnvelope size={14} />
                <span>sales@industrialsource.com</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '4px',
              padding: '8px 12px',
              width: '400px'
            }}>
              <input
                type="text"
                placeholder="Search raw materials..."
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  color: '#333'
                }}
              />
              <FaSearch color="#666" />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#account" style={{ color: 'white', textDecoration: 'none' }}>
                <FaUser size={20} />
                {/* <span style={{ marginLeft: '8px' }}>Account</span> */}
              </a>
              <a href="#quotes" style={{ color: 'white', textDecoration: 'none', position: 'relative' }}>
                <FaHeart size={20} />
                {/* <span style={{ marginLeft: '4px' }}>Saved Items</span> */}
                {quoteItems.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {quoteItems.length}
                  </span>
                )}
              </a>
              <a href="#cart" style={{ color: 'white', textDecoration: 'none' }}>
                <FaShoppingCart size={20} />
                {/* <span style={{ marginLeft: '4px' }}>Quote Cart</span> */}
              </a>
            </div>
          </div>

          <nav style={{ paddingBottom: '16px' }}>
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: '32px'
            }}>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Home</a></li>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Steel & Metal</a></li>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Concrete & Masonry</a></li>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Aggregates</a></li>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Industrial Equipment</a></li>
              <li><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '16px' }}>Bulk Orders</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main style={{ backgroundColor: '#f8f9fa', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 10px' }}>
          <div style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            <h1 style={{ margin: '0 0 12px 0', fontSize: '36px', fontWeight: 'bold' }}>
              Industrial Grade Raw Materials
            </h1>
            <p style={{ margin: '0 0 24px 0', fontSize: '17px', opacity: '0.9' }}>
              Bulk pricing • Fast delivery • Quality guaranteed • Custom orders welcome
            </p>
            <button style={{
              backgroundColor: 'white',
              color: '#3498db',
              border: 'none',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Request Bulk Quote
            </button>
          </div>

          <section>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              border: '1px solid #ddd', padding: '8px 16px', borderRadius: '4px'
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>
                Raw Materials Catalog
              </h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0',
              justifyContent: 'flex-center',
              paddingLeft:"70px"
            }}>
              {filteredMaterials.map((material) => (
                <RawMaterialCard
                  key={material.id}
                  material={material}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </div>
          </section>

          {/* B2B Features Section */}
          <section style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            marginTop: '40px'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '32px', color: '#2c3e50' }}>
              Why Choose IndustrialSource?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#3498db', marginBottom: '12px' }}>Bulk Pricing</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  Competitive wholesale prices with volume discounts for large orders
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#3498db', marginBottom: '12px' }}>Quality Certified</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  All materials meet industry standards with full documentation
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#3498db', marginBottom: '12px' }}>Fast Delivery</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  Direct from warehouse with expedited shipping options
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#3498db', marginBottom: '12px' }}>Custom Orders</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  Special specifications and custom fabrication available
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '40px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <h3 style={{ marginBottom: '16px' }}>Product Categories</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Steel & Metal</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Concrete & Masonry</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Aggregates</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Aluminum</a></li>
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px' }}>Business Services</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Bulk Orders</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Custom Fabrication</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Credit Terms</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Technical Support</a></li>
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px' }}>Support</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Contact Sales</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Material Specs</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Shipping Info</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Returns Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px' }}>Company</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>About Us</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Quality Certification</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Safety Standards</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Environmental Policy</a></li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #34495e',
            paddingTop: '24px',
            textAlign: 'center',
            color: '#95a5a6'
          }}>
            © {new Date().getFullYear()} IndustrialSource. All rights reserved. | Licensed Industrial Supplier
          </div>
        </div>
      </footer>

      <ChatWidget/>
    </>
  )
}

export default B2BRawMaterialsStore