import Skeleton from 'react-loading-skeleton';

export default function SkeletonCard() {
    return (
        <section className='product-card'>
            <>
                <section className='info'>
                    <h2 style={{ width: '100%' }}>
                        <Skeleton count={1} />
                    </h2>
                    <div className='image-skeleton'>
                        <Skeleton count={1} />
                    </div>
                    <section className='details'>
                        <div className='stock'>
                            <h3>
                                <Skeleton count={1} />
                            </h3>
                            <h5>Stock</h5>
                        </div>
                        <div className='price'>
                            <h3>
                                <Skeleton count={1} />
                            </h3>
                            <h5>GLMR</h5>
                        </div>
                    </section>
                    <button id='black-button-disabled' style={{ width: '100%' }} disabled={true}>
                        Order
                    </button>
                </section>
            </>
        </section>
    );
}
